import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { db, schema } from "./_lib/db";

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
    const { packId } = JSON.parse(event.body || "{}");

    if (!packId) {
      return jsonResponse(400, { error: "Pack ID is required" });
    }

    // Check if user exists
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    // Get the credit pack
    const [pack] = await db
      .select()
      .from(schema.creditPacks)
      .where(eq(schema.creditPacks.id, packId))
      .limit(1);

    if (!pack) {
      return jsonResponse(404, { error: "Credit pack not found" });
    }

    if (!pack.isActive) {
      return jsonResponse(400, { error: "This credit pack is no longer available" });
    }

    const totalCredits = pack.credits + pack.bonusCredits;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: pack.priceInPaise,
      currency: CURRENCY,
      receipt: `credits_${payload.userId}_${packId}_${Date.now()}`,
      notes: {
        userId: payload.userId,
        userEmail: user.email,
        purpose: "credit_purchase",
        packId: pack.id,
        packName: pack.name,
        credits: pack.credits,
        bonusCredits: pack.bonusCredits,
        totalCredits,
      },
    });

    // Store order in database
    await db.insert(schema.payments).values({
      userId: payload.userId,
      razorpayOrderId: order.id,
      amount: pack.priceInPaise,
      currency: CURRENCY,
      status: "created",
    });

    // Create pending credit purchase record
    await db.insert(schema.creditPurchases).values({
      userId: payload.userId,
      packId: pack.id,
      creditsGranted: totalCredits,
      amountPaid: pack.priceInPaise,
      status: "pending",
    });

    return jsonResponse(200, {
      orderId: order.id,
      amount: pack.priceInPaise,
      currency: CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
      packName: pack.name,
      creditsToGrant: totalCredits,
    });
  } catch (error) {
    console.error("Create credit order error:", error);
    return jsonResponse(500, { error: "Failed to create payment order" });
  }
};
