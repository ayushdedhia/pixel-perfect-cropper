import type { Handler } from "@netlify/functions";
import { eq, and, gt } from "drizzle-orm";
import { db, schema } from "./_lib/db";
import {
  verifyRefreshToken,
  generateTokens,
  parseRefreshTokenCookie,
  createRefreshTokenCookie,
  jsonResponse,
} from "./_lib/auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const refreshToken = parseRefreshTokenCookie(event.headers.cookie);

    if (!refreshToken) {
      return jsonResponse(401, { error: "No refresh token provided" });
    }

    // Verify the token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return jsonResponse(401, { error: "Invalid refresh token" });
    }

    // Find session in database
    const [session] = await db
      .select()
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.refreshToken, refreshToken),
          gt(schema.sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      return jsonResponse(401, { error: "Session not found or expired" });
    }

    // Get user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(401, { error: "User not found" });
    }

    // Delete old session
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, session.id));

    // Generate new tokens
    const tokens = generateTokens(user);

    // Store new refresh token
    await db.insert(schema.sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.isPremium,
        },
        accessToken: tokens.accessToken,
      }),
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": createRefreshTokenCookie(tokens.refreshToken, tokens.expiresAt),
      },
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
