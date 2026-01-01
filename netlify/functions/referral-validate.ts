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
      return jsonResponse(200, {
        valid: false,
        discount: 0,
        referrerName: null,
        message: "Invalid referral code format",
      });
    }

    // Find the referral code
    const [referralCode] = await db
      .select()
      .from(schema.referralCodes)
      .where(eq(schema.referralCodes.code, normalizedCode))
      .limit(1);

    if (!referralCode) {
      return jsonResponse(200, {
        valid: false,
        discount: 0,
        referrerName: null,
        message: "Referral code not found",
      });
    }

    // Check if user is trying to use their own code
    if (referralCode.userId === payload.userId) {
      return jsonResponse(200, {
        valid: false,
        discount: 0,
        referrerName: null,
        message: "You cannot use your own referral code",
      });
    }

    // Check if user has already used a referral code
    const [existingUsage] = await db
      .select()
      .from(schema.referralUsages)
      .where(eq(schema.referralUsages.referredUserId, payload.userId))
      .limit(1);

    if (existingUsage) {
      return jsonResponse(200, {
        valid: false,
        discount: 0,
        referrerName: null,
        message: "You have already used a referral code",
      });
    }

    // Get referrer's name for display (first name only)
    const [referrer] = await db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, referralCode.userId))
      .limit(1);

    const referrerName = referrer?.name?.split(" ")[0] || null;

    return jsonResponse(200, {
      valid: true,
      discount: REFERRAL_CONSTANTS.DISCOUNT_AMOUNT,
      referrerName,
      message: "Valid referral code",
    });
  } catch (error) {
    console.error("Validate referral code error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
