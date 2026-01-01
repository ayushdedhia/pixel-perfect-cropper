import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { db, schema } from "./_lib/db";
import { isValidReferralCodeFormat, REFERRAL_CONSTANTS } from "./_lib/referral";

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

    const { code } = JSON.parse(event.body || "{}");

    if (!code) {
      return jsonResponse(400, { error: "Referral code is required" });
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate code format
    if (!isValidReferralCodeFormat(normalizedCode)) {
      return jsonResponse(400, { error: "Invalid referral code format" });
    }

    // Find the referral code
    const [referralCode] = await db
      .select()
      .from(schema.referralCodes)
      .where(eq(schema.referralCodes.code, normalizedCode))
      .limit(1);

    if (!referralCode) {
      return jsonResponse(404, { error: "Referral code not found" });
    }

    // Check if user is trying to use their own code
    if (referralCode.userId === payload.userId) {
      return jsonResponse(400, { error: "You cannot use your own referral code" });
    }

    // Check if user has already used a referral code
    const [existingUsage] = await db
      .select()
      .from(schema.referralUsages)
      .where(eq(schema.referralUsages.referredUserId, payload.userId))
      .limit(1);

    if (existingUsage) {
      return jsonResponse(400, { error: "You have already used a referral code" });
    }

    // Check if user is already premium (no need for referral)
    const [user] = await db
      .select({ isPremium: schema.users.isPremium })
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (user?.isPremium) {
      return jsonResponse(400, { error: "You already have premium access" });
    }

    // Create referral usage record (pending status)
    await db.insert(schema.referralUsages).values({
      referralCodeId: referralCode.id,
      referredUserId: payload.userId,
      status: "pending",
      discountApplied: REFERRAL_CONSTANTS.DISCOUNT_AMOUNT,
    });

    return jsonResponse(200, {
      success: true,
      message: "Referral code applied successfully",
      discount: REFERRAL_CONSTANTS.DISCOUNT_AMOUNT,
    });
  } catch (error) {
    console.error("Apply referral code error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
