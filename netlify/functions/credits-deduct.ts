import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { calculateExportCost, ExportFormat, getMonthlyLimit, needsMonthlyReset } from "./_lib/credits";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
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

    const { format, quality, exportId } = JSON.parse(event.body || "{}");

    // Validate format
    const validFormats: ExportFormat[] = ["image/png", "image/jpeg", "image/webp"];
    if (!validFormats.includes(format)) {
      return jsonResponse(400, { error: "Invalid export format" });
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

    // Get wallet
    let [wallet] = await db
      .select()
      .from(schema.creditWallets)
      .where(eq(schema.creditWallets.userId, user.id))
      .limit(1);

    if (!wallet) {
      return jsonResponse(400, { error: "Wallet not found" });
    }

    // Check if monthly reset is needed first
    if (needsMonthlyReset(wallet.lastMonthlyReset)) {
      const monthlyLimit = getMonthlyLimit(user.isPremium);
      const newBalance = wallet.balance + monthlyLimit;

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

      await db.insert(schema.creditTransactions).values({
        walletId: wallet.id,
        type: "monthly_grant",
        amount: monthlyLimit,
        balanceAfter: newBalance,
        description: "Monthly credit refresh",
      });
    }

    // Calculate cost
    const costBreakdown = calculateExportCost({
      format: format as ExportFormat,
      quality: quality ?? 90,
    });

    // Check if user can afford
    if (wallet.balance < costBreakdown.total) {
      return jsonResponse(402, {
        error: "Insufficient credits",
        required: costBreakdown.total,
        available: wallet.balance,
      });
    }

    // Deduct credits
    const newBalance = wallet.balance - costBreakdown.total;
    const newMonthlyUsed = wallet.monthlyCreditsUsed + costBreakdown.total;

    [wallet] = await db
      .update(schema.creditWallets)
      .set({
        balance: newBalance,
        monthlyCreditsUsed: newMonthlyUsed,
        updatedAt: new Date(),
      })
      .where(eq(schema.creditWallets.id, wallet.id))
      .returning();

    // Create description
    const parts: string[] = ["Export"];
    if (costBreakdown.breakdown.format > 0) parts.push("Premium format");
    const description = `Image export: ${parts.join(", ")}`;

    // Record the transaction
    const [transaction] = await db
      .insert(schema.creditTransactions)
      .values({
        walletId: wallet.id,
        type: "export",
        amount: -costBreakdown.total,
        balanceAfter: newBalance,
        description,
        metadata: JSON.stringify({
          exportId,
          format,
          quality,
          breakdown: costBreakdown.breakdown,
        }),
      })
      .returning();

    return jsonResponse(200, {
      success: true,
      creditsDeducted: costBreakdown.total,
      newBalance: wallet.balance,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error("Deduct credits error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
