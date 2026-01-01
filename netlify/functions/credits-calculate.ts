import type { Handler } from "@netlify/functions";
import { eq } from "drizzle-orm";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";
import { calculateExportCost, ExportFormat } from "./_lib/credits";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
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

    const { format, quality } = JSON.parse(event.body || "{}");

    // Validate format
    const validFormats: ExportFormat[] = ["image/png", "image/jpeg", "image/webp"];
    if (!validFormats.includes(format)) {
      return jsonResponse(400, { error: "Invalid export format" });
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

    // Get wallet
    const [wallet] = await db
      .select()
      .from(schema.creditWallets)
      .where(eq(schema.creditWallets.userId, user.id))
      .limit(1);

    const currentBalance = wallet?.balance || 0;

    // Calculate cost
    const costBreakdown = calculateExportCost({
      format: format as ExportFormat,
      quality: quality ?? 90,
    });

    return jsonResponse(200, {
      cost: costBreakdown.total,
      breakdown: costBreakdown.breakdown,
      canAfford: currentBalance >= costBreakdown.total,
      currentBalance,
    });
  } catch (error) {
    console.error("Calculate credits error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
