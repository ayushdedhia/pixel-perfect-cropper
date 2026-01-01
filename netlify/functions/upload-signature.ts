import type { Handler } from "@netlify/functions";
import crypto from "crypto";

import { extractBearerToken, jsonResponse, verifyAccessToken } from "./_lib/auth";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
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

  // Validate Cloudinary config
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return jsonResponse(500, { error: "Cloudinary not configured" });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "profile-pictures";

    // Parameters to sign (must be in alphabetical order)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    // Generate signature
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    return jsonResponse(200, {
      signature,
      timestamp,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    return jsonResponse(500, { error: "Failed to generate upload signature" });
  }
};
