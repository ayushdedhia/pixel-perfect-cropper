import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db, schema } from "./_lib/db";
import { extractBearerToken, verifyAccessToken, jsonResponse } from "./_lib/auth";

export const handler: Handler = async (event) => {
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
    if (event.httpMethod === "GET") {
      // Get user profile
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.userId))
        .limit(1);

      if (!user) {
        return jsonResponse(404, { error: "User not found" });
      }

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
    }

    if (event.httpMethod === "PUT") {
      const { name, preferences: prefUpdate } = JSON.parse(event.body || "{}");

      // Update user name if provided
      if (name !== undefined) {
        await db
          .update(schema.users)
          .set({ name, updatedAt: new Date() })
          .where(eq(schema.users.id, payload.userId));
      }

      // Update preferences if provided
      if (prefUpdate) {
        await db
          .update(schema.preferences)
          .set({
            ...prefUpdate,
            updatedAt: new Date(),
          })
          .where(eq(schema.preferences.userId, payload.userId));
      }

      // Get updated user
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.userId))
        .limit(1);

      const [preferences] = await db
        .select()
        .from(schema.preferences)
        .where(eq(schema.preferences.userId, payload.userId))
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
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Profile error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
