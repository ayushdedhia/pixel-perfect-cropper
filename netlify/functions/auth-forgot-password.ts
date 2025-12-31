import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import crypto from "crypto";

import { jsonResponse } from "./_lib/auth";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return jsonResponse(400, { error: "Email is required" });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    // But only create token if user exists
    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");

      // Token expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Delete any existing reset tokens for this user
      await db
        .delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.userId, user.id));

      // Store the new reset token
      await db.insert(schema.passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // In a production app, you would send an email here
      // For demo purposes, we'll return the token (remove in production!)
      const resetUrl = `/reset-password?token=${token}`;

      console.log(`Password reset requested for ${email}. Reset URL: ${resetUrl}`);

      // For demo: return the reset URL
      // In production, remove this and just return success
      return jsonResponse(200, {
        message: "If an account exists with this email, a password reset link has been sent.",
        // Remove this in production - only for demo purposes
        resetUrl,
      });
    }

    // Return same message even if user doesn't exist (prevent enumeration)
    return jsonResponse(200, {
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
