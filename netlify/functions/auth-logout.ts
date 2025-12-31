import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { clearRefreshTokenCookie, jsonResponse, parseRefreshTokenCookie } from "./_lib/auth";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const refreshToken = parseRefreshTokenCookie(event.headers.cookie);

    if (refreshToken) {
      // Delete session from database
      await db.delete(schema.sessions).where(eq(schema.sessions.refreshToken, refreshToken));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearRefreshTokenCookie(),
      },
    };
  } catch (error) {
    console.error("Logout error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
