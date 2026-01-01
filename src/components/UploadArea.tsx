import { Upload, Image, Sparkles, Crop, Palette, Download } from "lucide-react";
import { useRef, useState } from "react";
import { fileToDataUrl } from "../utils/image-utils";

interface UploadAreaProps {
  onImageLoad: (dataUrl: string) => void;
}

export function UploadArea({ onImageLoad }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const dataUrl = await fileToDataUrl(file);
      onImageLoad(dataUrl);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      const dataUrl = await fileToDataUrl(e.dataTransfer.files[0]);
      onImageLoad(dataUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Main upload area */}
        <div
          className={`relative border-2 border-dashed rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 transition-all duration-300 cursor-pointer group text-center backdrop-blur-sm ${
            isDragging
              ? "border-violet-400 bg-violet-500/10 scale-[1.02]"
              : "border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/60 hover:border-violet-500/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl md:rounded-[2.5rem] bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Icon container */}
          <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transition-all duration-300 ${
            isDragging
              ? "bg-gradient-to-br from-violet-600 to-purple-600 scale-110"
              : "bg-gradient-to-br from-slate-800 to-slate-800/80 group-hover:from-violet-600 group-hover:to-purple-600 group-hover:scale-110"
          }`}>
            {/* Icon glow */}
            <div className={`absolute inset-0 rounded-2xl md:rounded-3xl transition-opacity duration-300 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`} style={{ boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)" }} />
            <Upload className={`relative w-9 h-9 md:w-11 md:h-11 transition-colors duration-300 ${
              isDragging ? "text-white" : "text-violet-400 group-hover:text-white"
            }`} />
          </div>

          {/* Text content */}
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </h2>
          <p className="text-slate-400 mb-8 md:mb-10 text-sm md:text-base max-w-sm mx-auto">
            <span className="hidden sm:inline">Drag and drop your image here, or </span>
            <span className="sm:hidden">Tap to </span>
            <span className="text-violet-400">browse</span> to start editing
          </p>

          {/* CTA Button */}
          <button className="relative bg-gradient-to-r from-violet-600 via-violet-500 to-purple-500 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:via-violet-400 hover:to-purple-400 active:scale-95">
            <span className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Choose File
            </span>
          </button>

          {/* Supported formats */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-2">
            {["PNG", "JPG", "WebP", "GIF"].map((format) => (
              <span
                key={format}
                className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-800/50 rounded-full border border-slate-700/50"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: <Crop className="w-5 h-5 text-violet-400" />, label: "Crop & Resize" },
            { icon: <Palette className="w-5 h-5 text-purple-400" />, label: "Filters" },
            { icon: <Download className="w-5 h-5 text-fuchsia-400" />, label: "Export" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-2.5 p-3 md:p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200"
            >
              {feature.icon}
              <span className="text-xs md:text-sm text-slate-400 font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Premium hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-400/70" />
          <span>Upgrade to <span className="text-amber-400/90 font-medium">Premium</span> for watermark-free exports</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
