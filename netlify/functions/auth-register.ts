import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db, schema } from "./_lib/db";
import {
  hashPassword,
  generateTokens,
  createRefreshTokenCookie,
  jsonResponse,
} from "./_lib/auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const { email, password, name } = JSON.parse(event.body || "{}");

    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required" });
    }

    if (password.length < 8) {
      return jsonResponse(400, { error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return jsonResponse(409, { error: "Email already registered" });
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(schema.users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
      })
      .returning();

    // Generate tokens
    const tokens = generateTokens(newUser);

    // Store refresh token in session
    await db.insert(schema.sessions).values({
      userId: newUser.id,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    });

    // Create default preferences
    await db.insert(schema.preferences).values({
      userId: newUser.id,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isPremium: newUser.isPremium,
        },
        accessToken: tokens.accessToken,
      }),
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": createRefreshTokenCookie(tokens.refreshToken, tokens.expiresAt),
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
