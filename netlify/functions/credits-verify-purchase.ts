import type { Handler } from "@netlify/functions";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { getMonthlyLimit } from "./_lib/credits";
import { db, schema } from "./_lib/db";

interface PaymentVerificationBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  packId: string;
}

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packId) {
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

    // Get user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    // Find the pending credit purchase
    const [creditPurchase] = await db
      .select()
      .from(schema.creditPurchases)
      .where(
        and(
          eq(schema.creditPurchases.userId, payload.userId),
          eq(schema.creditPurchases.packId, packId),
          eq(schema.creditPurchases.status, "pending")
        )
      )
      .limit(1);

    if (!creditPurchase) {
      return jsonResponse(404, { error: "Credit purchase not found" });
    }

    // Check if already processed (idempotency)
    if (payment.status === "paid") {
      const [wallet] = await db
        .select()
        .from(schema.creditWallets)
        .where(eq(schema.creditWallets.userId, payload.userId))
        .limit(1);

      return jsonResponse(200, {
        success: true,
        message: "Payment already processed",
        creditsGranted: creditPurchase.creditsGranted,
        newBalance: wallet?.balance || 0,
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

    // Update credit purchase record
    await db
      .update(schema.creditPurchases)
      .set({
        paymentId: payment.id,
        status: "completed",
      })
      .where(eq(schema.creditPurchases.id, creditPurchase.id));

    // Get or create wallet
    let [wallet] = await db
      .select()
      .from(schema.creditWallets)
      .where(eq(schema.creditWallets.userId, payload.userId))
      .limit(1);

    if (!wallet) {
      const initialLimit = getMonthlyLimit(user.isPremium);
      [wallet] = await db
        .insert(schema.creditWallets)
        .values({
          userId: payload.userId,
          balance: 0,
          monthlyCreditsLimit: initialLimit,
        })
        .returning();
    }

    // Add credits to wallet
    const newBalance = wallet.balance + creditPurchase.creditsGranted;
    [wallet] = await db
      .update(schema.creditWallets)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(schema.creditWallets.id, wallet.id))
      .returning();

    // Get pack name for description
    const [pack] = await db
      .select()
      .from(schema.creditPacks)
      .where(eq(schema.creditPacks.id, packId))
      .limit(1);

    // Record the transaction
    await db.insert(schema.creditTransactions).values({
      walletId: wallet.id,
      type: "purchase",
      amount: creditPurchase.creditsGranted,
      balanceAfter: newBalance,
      description: `Purchased ${pack?.name || "credit pack"} - ${
        creditPurchase.creditsGranted
      } credits`,
      metadata: JSON.stringify({
        packId,
        packName: pack?.name,
        paymentId: payment.id,
        amountPaid: creditPurchase.amountPaid,
      }),
    });

    return jsonResponse(200, {
      success: true,
      creditsGranted: creditPurchase.creditsGranted,
      newBalance: wallet.balance,
    });
  } catch (error) {
    console.error("Credit purchase verification error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
