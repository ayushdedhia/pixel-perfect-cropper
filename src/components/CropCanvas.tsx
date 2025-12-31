import { forwardRef, useState, useMemo } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import { ZoomIn, ZoomOut } from "lucide-react";

import type { ImageFilters } from "../types";
import { CropPreview } from "./CropPreview";

interface CropCanvasProps {
  image: string;
  crop: Crop | undefined;
  completedCrop: PixelCrop | undefined;
  aspect: number | undefined;
  circular: boolean;
  filters: ImageFilters;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const CropCanvas = forwardRef<HTMLImageElement, CropCanvasProps>(
  (
    {
      image,
      crop,
      completedCrop,
      aspect,
      circular,
      filters,
      onCropChange,
      onCropComplete,
      onImageLoad,
    },
    ref
  ) => {
    const [showPreview, setShowPreview] = useState(true);
    const [zoomToSelection, setZoomToSelection] = useState(false);

    const imgEl = (ref as React.RefObject<HTMLImageElement>)?.current;
    const hasValidCrop = completedCrop && completedCrop.width > 0 && completedCrop.height > 0;

    const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${
      filters.saturation
    }%) blur(${filters.blur || 0}px) ${filters.grayscale ? "grayscale(100%)" : ""} ${
      filters.sepia ? "sepia(100%)" : ""
    }`;

    const transformStyle = `rotate(${filters.rotation}deg) scale(${filters.flipH ? -1 : 1}, ${
      filters.flipV ? -1 : 1
    })`;

    // Calculate zoom transform when zoomToSelection is enabled
    const zoomTransform = useMemo(() => {
      if (!zoomToSelection || !hasValidCrop || !imgEl) {
        return { scale: 1, originX: "50%", originY: "50%" };
      }

      // Calculate scale to make crop area larger (2x zoom)
      const scale = 2;

      // Calculate transform origin as the center of the crop selection
      const cropCenterX = completedCrop.x + completedCrop.width / 2;
      const cropCenterY = completedCrop.y + completedCrop.height / 2;

      // Convert to percentage of image dimensions
      const originX = `${(cropCenterX / imgEl.width) * 100}%`;
      const originY = `${(cropCenterY / imgEl.height) * 100}%`;

      return { scale, originX, originY };
    }, [zoomToSelection, hasValidCrop, completedCrop, imgEl]);

    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-auto relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] min-h-0">
        <div
          className={`transition-transform duration-300 ease-out ${zoomToSelection ? "zoom-container" : ""}`}
          style={{
            transform: `scale(${zoomTransform.scale})`,
            transformOrigin: `${zoomTransform.originX} ${zoomTransform.originY}`,
            "--zoom-scale": zoomTransform.scale,
          } as React.CSSProperties}
        >
          <ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            aspect={aspect}
            ruleOfThirds
            circularCrop={circular}
          >
            <img
              ref={ref}
              src={image}
              alt="Edit Target"
              onLoad={onImageLoad}
              className="max-w-full block select-none transition-transform duration-400"
              style={{
                filter: filterStyle,
                transform: transformStyle,
                maxHeight: "min(50vh, 400px)",
                transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
            />
          </ReactCrop>
        </div>

        {/* Preview panel - desktop only */}
        {showPreview && hasValidCrop && imgEl && !zoomToSelection && (
          <div className="hidden lg:block">
            <CropPreview
              image={image}
              crop={completedCrop}
              imageWidth={imgEl.width}
              imageHeight={imgEl.height}
              filters={filters}
              circular={circular}
              onClose={() => setShowPreview(false)}
            />
          </div>
        )}

        {/* Zoom toggle - desktop only */}
        {hasValidCrop && (
          <button
            onClick={() => setZoomToSelection(!zoomToSelection)}
            className={`hidden lg:flex absolute bottom-4 left-4 items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors backdrop-blur-sm ${
              zoomToSelection
                ? "bg-indigo-600/90 border-indigo-500 text-white hover:bg-indigo-700"
                : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title={zoomToSelection ? "Zoom out" : "Zoom to selection"}
          >
            {zoomToSelection ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            <span>{zoomToSelection ? "Zoom Out" : "Zoom In"}</span>
          </button>
        )}

        {/* Zoom indicator - desktop only */}
        {zoomToSelection && (
          <div className="hidden lg:block absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-400 backdrop-blur-sm">
            200% - Drag to adjust crop
          </div>
        )}
      </div>
    );
  }
);

CropCanvas.displayName = "CropCanvas";
