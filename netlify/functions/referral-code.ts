import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { db, schema } from "./_lib/db";
import { generateReferralCode, maskEmail } from "./_lib/referral";

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

    // Check if user already has a referral code
    let [referralCode] = await db
      .select()
      .from(schema.referralCodes)
      .where(eq(schema.referralCodes.userId, payload.userId))
      .limit(1);

    // If no code exists, generate one
    if (!referralCode) {
      let code = generateReferralCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Retry if code already exists (extremely rare)
      while (attempts < maxAttempts) {
        const [existing] = await db
          .select()
          .from(schema.referralCodes)
          .where(eq(schema.referralCodes.code, code))
          .limit(1);

        if (!existing) break;
        code = generateReferralCode();
        attempts++;
      }

      [referralCode] = await db
        .insert(schema.referralCodes)
        .values({
          userId: payload.userId,
          code,
        })
        .returning();
    }

    // Get referred users for this code
    const referredUsages = await db
      .select({
        id: schema.referralUsages.id,
        status: schema.referralUsages.status,
        createdAt: schema.referralUsages.createdAt,
        referredUserId: schema.referralUsages.referredUserId,
      })
      .from(schema.referralUsages)
      .where(eq(schema.referralUsages.referralCodeId, referralCode.id));

    // Get emails for referred users (masked for privacy)
    const referredUsers = await Promise.all(
      referredUsages.map(async (usage) => {
        const [user] = await db
          .select({ email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, usage.referredUserId))
          .limit(1);

        return {
          email: user ? maskEmail(user.email) : "Unknown",
          status: usage.status,
          createdAt: usage.createdAt.toISOString(),
        };
      })
    );

    return jsonResponse(200, {
      code: referralCode.code,
      successfulReferrals: referralCode.successfulReferrals,
      referredUsers,
    });
  } catch (error) {
    console.error("Get referral code error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
