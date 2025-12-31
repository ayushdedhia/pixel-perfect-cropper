import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db, schema } from "./_lib/db";
import { extractBearerToken, verifyAccessToken, jsonResponse } from "./_lib/auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const token = extractBearerToken(event.headers.authorization);

    if (!token) {
      return jsonResponse(401, { error: "No access token provided" });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return jsonResponse(401, { error: "Invalid access token" });
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) {
      return jsonResponse(404, { error: "User not found" });
    }

    // Get user preferences
    const [preferences] = await db
      .select()
      .from(schema.preferences)
      .where(eq(schema.preferences.userId, user.id))
      .limit(1);

    return jsonResponse(200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
      preferences: preferences || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
