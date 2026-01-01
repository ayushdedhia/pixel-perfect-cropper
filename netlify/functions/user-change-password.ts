import type { Handler } from "@netlify/functions";
import { eq, ne, and } from "drizzle-orm";

import {
  extractBearerToken,
  hashPassword,
  jsonResponse,
  verifyAccessToken,
  verifyPassword,
  parseRefreshTokenCookie,
} from "./_lib/auth";
import { db, schema } from "./_lib/db";

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
    const { currentPassword, newPassword } = JSON.parse(event.body || "{}");

    // Validate input
    if (!currentPassword || !newPassword) {
      return jsonResponse(400, { error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return jsonResponse(400, { error: "New password must be at least 8 characters" });
    }

    // Get user with password hash
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return jsonResponse(400, { error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(schema.users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, payload.userId));

    // Invalidate all other sessions (except current one)
    const currentRefreshToken = parseRefreshTokenCookie(event.headers.cookie);
    if (currentRefreshToken) {
      await db
        .delete(schema.sessions)
        .where(
          and(
            eq(schema.sessions.userId, payload.userId),
            ne(schema.sessions.refreshToken, currentRefreshToken)
          )
        );
    } else {
      // If no current refresh token, invalidate all sessions
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userId, payload.userId));
    }

    return jsonResponse(200, {
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
