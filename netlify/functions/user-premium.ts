import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db, schema } from "./_lib/db";
import { extractBearerToken, verifyAccessToken, jsonResponse } from "./_lib/auth";

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
    // In a real application, you would:
    // 1. Verify payment with Stripe/Razorpay
    // 2. Check payment status
    // 3. Only then upgrade user to premium

    const { paymentId } = JSON.parse(event.body || "{}");

    if (!paymentId) {
      return jsonResponse(400, {
        error: "Payment verification required",
        message: "Payment integration coming soon",
      });
    }

    // Update user to premium
    const [updatedUser] = await db
      .update(schema.users)
      .set({ isPremium: true, updatedAt: new Date() })
      .where(eq(schema.users.id, payload.userId))
      .returning();

    return jsonResponse(200, {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isPremium: updatedUser.isPremium,
      },
    });
  } catch (error) {
    console.error("Premium upgrade error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
