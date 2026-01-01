import type { Handler } from "@netlify/functions";
import Razorpay from "razorpay";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { db, schema } from "./_lib/db";
import { REFERRAL_CONSTANTS } from "./_lib/referral";

const PREMIUM_AMOUNT = REFERRAL_CONSTANTS.BASE_PREMIUM_AMOUNT; // ₹299 in paise
const CURRENCY = "INR";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  // Verify authentication
  const token = extractBearerToken(event.headers.authorization);
  if (!token) {
    return jsonResponse(401, { error: "No access token provided" });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return jsonResponse(401, { error: "Invalid access token" });
  }

  try {
    // Check if user exists and is not already premium
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    if (user.isPremium) {
      return jsonResponse(400, { error: "User is already premium" });
    }

    // Check if user has a pending referral usage (applied a referral code)
    let finalAmount = PREMIUM_AMOUNT;
    let discountApplied = 0;
    let discountSource: string | null = null;

    const [referralUsage] = await db
      .select()
      .from(schema.referralUsages)
      .where(eq(schema.referralUsages.referredUserId, payload.userId))
      .limit(1);

    if (referralUsage && referralUsage.status === "pending") {
      // User has applied a referral code - they get 10% off
      discountApplied = REFERRAL_CONSTANTS.DISCOUNT_AMOUNT;
      finalAmount = REFERRAL_CONSTANTS.DISCOUNTED_AMOUNT;
      discountSource = "referral_code_used";
    }

    // Create Razorpay order with potentially discounted amount
    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: CURRENCY,
      receipt: `premium_${payload.userId}_${Date.now()}`,
      notes: {
        userId: payload.userId,
        userEmail: user.email,
        purpose: "premium_upgrade",
        discountSource: discountSource || "none",
        discountAmount: discountApplied,
      },
    });

    // Store order in database
    await db.insert(schema.payments).values({
      userId: payload.userId,
      razorpayOrderId: order.id,
      amount: finalAmount,
      currency: CURRENCY,
      status: "created",
    });

    return jsonResponse(200, {
      orderId: order.id,
      amount: finalAmount,
      originalAmount: PREMIUM_AMOUNT,
      discount: discountApplied,
      discountSource,
      currency: CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return jsonResponse(500, { error: "Failed to create payment order" });
  }
};
