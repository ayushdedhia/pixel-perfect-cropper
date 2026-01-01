import { X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ProfilePictureCropperProps {
  imageFile: File;
  onSave: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 80,
      },
      1,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ProfilePictureCropper({ imageFile, onSave, onCancel }: ProfilePictureCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageSrc, setImageSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  // Load the image when component mounts
  useState(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(imageFile);
  });

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const handleSave = async () => {
    if (!imgRef.current || !crop) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate the crop area in pixels
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = (crop.x / 100) * image.width * scaleX;
    const cropY = (crop.y / 100) * image.height * scaleY;
    const cropWidth = (crop.width / 100) * image.width * scaleX;
    const cropHeight = (crop.height / 100) * image.height * scaleY;

    // Set output size (square, max 512px for profile pictures)
    const outputSize = Math.min(512, cropWidth, cropHeight);
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Apply transformations
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-outputSize / 2, -outputSize / 2);

    // Draw the cropped image
    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize);

    // Try WebP first (better compression), fallback to JPEG
    const tryFormat = (format: string, quality: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          format,
          quality
        );
      });
    };

    // Try WebP with high quality (better compression than JPEG)
    let blob = await tryFormat("image/webp", 0.85);

    // Fallback to JPEG if WebP not supported or failed
    if (!blob) {
      blob = await tryFormat("image/jpeg", 0.85);
    }

    if (blob) {
      onSave(blob);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Adjust Profile Picture</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4 bg-slate-950/50">
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-800/50 min-h-75 max-h-100">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={1}
              circularCrop
              className="max-h-100"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  maxHeight: "400px",
                  width: "auto",
                }}
                className="transition-transform duration-200"
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleZoomOut}
              className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>

            <div className="flex items-center gap-3 px-4">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-32 sm:w-40 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-xs text-slate-400 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <button
              onClick={handleZoomIn}
              className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>

            <div className="w-px h-8 bg-slate-700 mx-2" />

            <button
              onClick={handleRotate}
              className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50"
              title="Rotate 90°"
            >
              <RotateCw size={20} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all"
          >
            <Check size={18} />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
