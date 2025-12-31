import { type PixelCrop } from "react-image-crop";

import { ASPECT_RATIOS } from "../constants";
import type { ExportConfig } from "../types";

interface StatusBarProps {
  aspect: number | undefined;
  completedCrop: PixelCrop | undefined;
  exportConfig: ExportConfig;
}

export function StatusBar({ aspect, completedCrop, exportConfig }: StatusBarProps) {
  return (
    <div className="h-10 md:h-12 border-t border-slate-800 bg-slate-900/50 flex items-center px-3 md:px-6 gap-3 md:gap-6 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="hidden sm:inline">Aspect:</span> {aspect ? ASPECT_RATIOS.find((r) => r.value === aspect)?.label : "Free"}
      </div>
      {completedCrop && (
        <div className="flex items-center gap-1.5 md:gap-2 text-indigo-400">
          <span className="hidden sm:inline">Selection:</span> {Math.round(completedCrop.width)}x{Math.round(completedCrop.height)}<span className="hidden sm:inline"> px</span>
        </div>
      )}
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <span>
          {exportConfig.format.split("/")[1].toUpperCase()}<span className="hidden sm:inline"> {exportConfig.quality}%</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span className="hidden sm:inline">Ready</span>
      </div>
    </div>
  );
}
