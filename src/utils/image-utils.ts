import type { Area, ImageFilters, ExportConfig } from "../types";

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const text = "Made with PixelCropper";
  const mainFontSize = Math.max(32, Math.min(120, height * 0.12));
  const smallFontSize = Math.max(14, Math.min(32, height * 0.04));
  const angle = (-30 * Math.PI) / 180;

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 6;

  // Draw main centered watermark
  ctx.font = `italic ${mainFontSize}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // Draw smaller watermarks in a grid pattern
  ctx.font = `italic ${smallFontSize}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.shadowBlur = 3;

  const positions = [
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.2 },
    { x: 0.2, y: 0.8 },
    { x: 0.8, y: 0.8 },
    { x: 0.5, y: 0.25 },
    { x: 0.5, y: 0.75 },
  ];

  for (const pos of positions) {
    ctx.save();
    ctx.translate(width * pos.x, height * pos.y);
    ctx.rotate(angle);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
};

/**
 * Handles complex image processing including rotation, flipping, and format export
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  filters: ImageFilters,
  displaySize: { width: number; height: number },
  exportConfig: ExportConfig,
  skipWatermark: boolean = false
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Calculate scales between natural and display size
  const scaleX = image.naturalWidth / displaySize.width;
  const scaleY = image.naturalHeight / displaySize.height;

  // Final dimensions for the crop
  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;

  // Apply visual filters
  const filterString = `
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%) 
    blur(${filters.blur || 0}px)
    ${filters.grayscale ? "grayscale(100%)" : ""} 
    ${filters.sepia ? "sepia(100%)" : ""}
  `;
  ctx.filter = filterString.trim();

  // Handle Circular Clipping
  if (exportConfig.circular) {
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.clip();
  }

  // Handle Transformations (Rotation and Flipping)
  ctx.save();

  // Move origin to center of canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Apply Rotation (degrees to radians)
  ctx.rotate((filters.rotation * Math.PI) / 180);

  // Apply Mirroring
  ctx.scale(filters.flipH ? -1 : 1, filters.flipV ? -1 : 1);

  // Draw image segment from source center back to target center
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  ctx.restore();

  // Add watermark for free users
  if (!skipWatermark) {
    drawWatermark(ctx, canvas.width, canvas.height);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"));
          return;
        }
        resolve(blob);
      },
      exportConfig.format,
      exportConfig.quality / 100
    );
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
