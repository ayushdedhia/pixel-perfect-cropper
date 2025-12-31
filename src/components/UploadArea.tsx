import { Upload } from "lucide-react";
import { useRef } from "react";
import { fileToDataUrl } from "../utils/image-utils";

interface UploadAreaProps {
  onImageLoad: (dataUrl: string) => void;
}

export function UploadArea({ onImageLoad }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const dataUrl = await fileToDataUrl(file);
      onImageLoad(dataUrl);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const dataUrl = await fileToDataUrl(e.dataTransfer.files[0]);
      onImageLoad(dataUrl);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full">
        <div
          className="border-2 border-dashed border-slate-700 rounded-2xl md:rounded-[3rem] p-8 md:p-20 bg-slate-900/30 hover:bg-slate-900/50 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-2xl text-center"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-xl">
            <Upload className="w-8 h-8 md:w-10 md:h-10 text-indigo-400 group-hover:text-white" />
          </div>
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 text-white">Upload an image</h2>
          <p className="text-slate-400 mb-6 md:mb-10 text-sm md:text-lg">
            <span className="hidden sm:inline">Drag and drop or </span>Browse to start editing
          </p>
          <button className="bg-white text-slate-950 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-slate-200 transition-colors shadow-xl active:scale-95">
            Choose File
          </button>
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
