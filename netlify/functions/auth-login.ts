import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import {
  createRefreshTokenCookie,
  generateTokens,
  jsonResponse,
  verifyPassword,
} from "./_lib/auth";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const { email, password } = JSON.parse(event.body || "{}");

    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required" });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return jsonResponse(401, { error: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return jsonResponse(401, { error: "Invalid email or password" });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token in session
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
    console.error("Login error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
