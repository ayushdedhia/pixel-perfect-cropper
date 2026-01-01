import type { Handler } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";

import { jsonResponse } from "./_lib/auth";
import { CREDIT_CONSTANTS, formatPriceInRupees } from "./_lib/credits";
import { db, schema } from "./_lib/db";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    // Get active packs from database
    let packs = await db
      .select()
      .from(schema.creditPacks)
      .where(eq(schema.creditPacks.isActive, true))
      .orderBy(asc(schema.creditPacks.sortOrder));

    // If no packs in database, seed them
    if (packs.length === 0) {
      await db.insert(schema.creditPacks).values(
        CREDIT_CONSTANTS.DEFAULT_PACKS.map((pack) => ({
          name: pack.name,
          credits: pack.credits,
          bonusCredits: pack.bonusCredits,
          priceInPaise: pack.priceInPaise,
          sortOrder: pack.sortOrder,
        }))
      );

      // Fetch the newly created packs
      packs = await db
        .select()
        .from(schema.creditPacks)
        .where(eq(schema.creditPacks.isActive, true))
        .orderBy(asc(schema.creditPacks.sortOrder));
    }

    return jsonResponse(200, {
      packs: packs.map((pack) => ({
        id: pack.id,
        name: pack.name,
        credits: pack.credits,
        bonusCredits: pack.bonusCredits,
        totalCredits: pack.credits + pack.bonusCredits,
        priceInPaise: pack.priceInPaise,
        priceFormatted: formatPriceInRupees(pack.priceInPaise),
      })),
    });
  } catch (error) {
    console.error("Get credit packs error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};
