import { userApi, type UploadSignatureResponse } from "./api";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(file: File | Blob): Promise<CloudinaryUploadResult> {
  // Get signed upload params from our API
  const signatureData: UploadSignatureResponse = await userApi.getUploadSignature();

  // Create form data for upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", signatureData.timestamp.toString());
  formData.append("signature", signatureData.signature);
  formData.append("folder", signatureData.folder);

  // Upload to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Upload failed" } }));
    throw new Error(error.error?.message || "Failed to upload image");
  }

  return response.json();
}

export async function uploadDataUrlToCloudinary(dataUrl: string): Promise<CloudinaryUploadResult> {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return uploadToCloudinary(blob);
}
