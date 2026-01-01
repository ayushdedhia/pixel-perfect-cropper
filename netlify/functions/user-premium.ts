import type { Handler } from "@netlify/functions";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { db, schema } from "./_lib/db";
import { REFERRAL_CONSTANTS } from "./_lib/referral";

interface PaymentVerificationBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

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
    const body: PaymentVerificationBody = JSON.parse(event.body || "{}");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonResponse(400, { error: "Missing payment verification data" });
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error("Invalid Razorpay signature for order:", razorpay_order_id);
      return jsonResponse(400, { error: "Invalid payment signature" });
    }

    // Find the payment record
    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.razorpayOrderId, razorpay_order_id))
      .limit(1);

    if (!payment) {
      return jsonResponse(404, { error: "Payment order not found" });
    }

    // Check if payment belongs to this user
    if (payment.userId !== payload.userId) {
      return jsonResponse(403, { error: "Payment does not belong to this user" });
    }

    // Check if already processed (idempotency)
    if (payment.status === "paid") {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.userId))
        .limit(1);

      return jsonResponse(200, {
        success: true,
        message: "Payment already processed",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePictureUrl: user.profilePictureUrl,
          isPremium: user.isPremium,
        },
      });
    }

    // Update payment record
    await db
      .update(schema.payments)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        updatedAt: new Date(),
      })
      .where(eq(schema.payments.id, payment.id));

    // Upgrade user to premium
    const [updatedUser] = await db
      .update(schema.users)
      .set({ isPremium: true, updatedAt: new Date() })
      .where(eq(schema.users.id, payload.userId))
      .returning();

    // Handle referral tracking if user used a referral code
    const [referralUsage] = await db
      .select()
      .from(schema.referralUsages)
      .where(eq(schema.referralUsages.referredUserId, payload.userId))
      .limit(1);

    if (referralUsage && referralUsage.status === "pending") {
      // Update referral usage to paid
      await db
        .update(schema.referralUsages)
        .set({
          status: "paid",
          paymentId: payment.id,
          paidAt: new Date(),
        })
        .where(eq(schema.referralUsages.id, referralUsage.id));

      // Increment referrer's successful referral count
      await db
        .update(schema.referralCodes)
        .set({
          successfulReferrals: sql`${schema.referralCodes.successfulReferrals} + 1`,
        })
        .where(eq(schema.referralCodes.id, referralUsage.referralCodeId));

      // Check if referrer now qualifies for free premium (3 successful referrals)
      const [referralCode] = await db
        .select()
        .from(schema.referralCodes)
        .where(eq(schema.referralCodes.id, referralUsage.referralCodeId))
        .limit(1);

      if (referralCode && referralCode.successfulReferrals >= REFERRAL_CONSTANTS.REFERRALS_FOR_FREE_PREMIUM) {
        // Grant free premium to the referrer
        await db
          .update(schema.users)
          .set({ isPremium: true, updatedAt: new Date() })
          .where(eq(schema.users.id, referralCode.userId));
      }
    }

    return jsonResponse(200, {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePictureUrl: updatedUser.profilePictureUrl,
        isPremium: updatedUser.isPremium,
      },
    });
  } catch (error) {
    console.error("Premium upgrade error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
