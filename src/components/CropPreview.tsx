import { X } from "lucide-react";
import type { PixelCrop } from "react-image-crop";

import type { ImageFilters } from "../types";

interface CropPreviewProps {
  image: string;
  crop: PixelCrop;
  imageWidth: number;
  imageHeight: number;
  filters: ImageFilters;
  circular: boolean;
  onClose: () => void;
}

export function CropPreview({
  image,
  crop,
  imageWidth,
  imageHeight,
  filters,
  circular,
  onClose,
}: CropPreviewProps) {
  // Calculate scale to fit the crop in the preview box
  const previewSize = 200;
  const scaleX = previewSize / crop.width;
  const scaleY = previewSize / crop.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  return (
    <div className="absolute top-4 right-4 z-10 bg-slate-900/95 border border-slate-700 rounded-lg p-2 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">Preview</span>
        <button
          onClick={onClose}
          className="p-0.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      <div
        className="overflow-hidden bg-slate-800"
        style={{
          width: crop.width * scale,
          height: crop.height * scale,
          borderRadius: circular ? "50%" : "4px",
        }}
      >
        <img
          src={image}
          alt="Crop preview"
          className="block max-w-none"
          style={{
            width: scaledWidth,
            height: scaledHeight,
            marginLeft: -crop.x * scale,
            marginTop: -crop.y * scale,
            filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${
              filters.saturation
            }%) blur(${filters.blur || 0}px) ${filters.grayscale ? "grayscale(100%)" : ""} ${
              filters.sepia ? "sepia(100%)" : ""
            }`,
            transform: `rotate(${filters.rotation}deg) scale(${filters.flipH ? -1 : 1}, ${
              filters.flipV ? -1 : 1
            })`,
          }}
        />
      </div>

      <div className="mt-1.5 text-xs text-slate-500 text-center">
        {Math.round(crop.width)} × {Math.round(crop.height)}px
      </div>
    </div>
  );
}
