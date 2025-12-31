import { Circle, Square } from "lucide-react";
import { ASPECT_RATIOS } from "../../constants";
import type { ExportConfig } from "../../types";

interface CropSettingsProps {
  aspect: number | undefined;
  exportConfig: ExportConfig;
  onAspectChange: (aspect: number | undefined) => void;
  onCircularChange: (circular: boolean) => void;
}

export function CropSettings({ aspect, exportConfig, onAspectChange, onCircularChange }: CropSettingsProps) {
  return (
    <div className="p-4 md:p-6 border-b border-slate-800">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          Crop Area
        </h3>
        <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700">
          <button
            onClick={() => onCircularChange(false)}
            className={`p-1.5 rounded-md transition-all ${
              !exportConfig.circular
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onCircularChange(true);
              onAspectChange(1);
            }}
            className={`p-1.5 rounded-md transition-all ${
              exportConfig.circular
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-6 md:grid-cols-3 gap-1.5 md:gap-2">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.label}
            onClick={() => {
              onAspectChange(ratio.value);
              if (exportConfig.circular && ratio.value !== 1) {
                onCircularChange(false);
              }
            }}
            className={`py-1.5 md:py-2 text-[9px] md:text-[10px] font-black rounded-lg border transition-all ${
              aspect === ratio.value
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
            }`}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    </div>
  );
}
