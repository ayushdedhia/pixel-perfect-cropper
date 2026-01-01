import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { getDaysUntilReset, getMonthlyLimit, needsMonthlyReset } from "./_lib/credits";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const token = extractBearerToken(event.headers.authorization);

    if (!token) {
      return jsonResponse(401, { error: "No access token provided" });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return jsonResponse(401, { error: "Invalid access token" });
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    // Get or create wallet
    let [wallet] = await db
      .select()
      .from(schema.creditWallets)
      .where(eq(schema.creditWallets.userId, user.id))
      .limit(1);

    // Create wallet if it doesn't exist (for existing users before credits system)
    if (!wallet) {
      const initialCredits = getMonthlyLimit(user.isPremium);
      [wallet] = await db
        .insert(schema.creditWallets)
        .values({
          userId: user.id,
          balance: initialCredits,
          monthlyCreditsLimit: initialCredits,
        })
        .returning();

      // Record the initial credit grant
      await db.insert(schema.creditTransactions).values({
        walletId: wallet.id,
        type: "monthly_grant",
        amount: initialCredits,
        balanceAfter: initialCredits,
        description: "Initial monthly credits",
      });
    }

    // Check if monthly reset is needed
    if (needsMonthlyReset(wallet.lastMonthlyReset)) {
      const monthlyLimit = getMonthlyLimit(user.isPremium);
      const newBalance = wallet.balance + monthlyLimit;

      // Update wallet with reset
      [wallet] = await db
        .update(schema.creditWallets)
        .set({
          balance: newBalance,
          monthlyCreditsUsed: 0,
          monthlyCreditsLimit: monthlyLimit,
          lastMonthlyReset: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.creditWallets.id, wallet.id))
        .returning();

      // Record the monthly grant transaction
      await db.insert(schema.creditTransactions).values({
        walletId: wallet.id,
        type: "monthly_grant",
        amount: monthlyLimit,
        balanceAfter: newBalance,
        description: "Monthly credit refresh",
      });
    }

    const monthlyCreditsRemaining = wallet.monthlyCreditsLimit - wallet.monthlyCreditsUsed;

    return jsonResponse(200, {
      balance: wallet.balance,
      monthlyCreditsUsed: wallet.monthlyCreditsUsed,
      monthlyCreditsLimit: wallet.monthlyCreditsLimit,
      monthlyCreditsRemaining: Math.max(0, monthlyCreditsRemaining),
      daysUntilReset: getDaysUntilReset(),
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("Get credits balance error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
