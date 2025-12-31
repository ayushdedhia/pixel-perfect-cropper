import type { Handler } from "@netlify/functions";
import { eq, and, gt, isNull } from "drizzle-orm";

import { hashPassword, jsonResponse } from "./_lib/auth";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const { token, password } = JSON.parse(event.body || "{}");

    if (!token || !password) {
      return jsonResponse(400, { error: "Token and password are required" });
    }

    if (password.length < 6) {
      return jsonResponse(400, { error: "Password must be at least 6 characters" });
    }

    // Find valid reset token (not expired, not used)
    const [resetToken] = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.token, token),
          gt(schema.passwordResetTokens.expiresAt, new Date()),
          isNull(schema.passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      return jsonResponse(400, { error: "Invalid or expired reset token" });
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    await db
      .update(schema.users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordResetTokens.id, resetToken.id));

    // Invalidate all existing sessions for this user (security measure)
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.userId, resetToken.userId));

    return jsonResponse(200, {
      message: "Password has been reset successfully. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
