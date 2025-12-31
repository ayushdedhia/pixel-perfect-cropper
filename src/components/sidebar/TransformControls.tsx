import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from "lucide-react";
import type { ImageFilters } from "../../types";

interface TransformControlsProps {
  filters: ImageFilters;
  onUpdateFilters: (filters: Partial<ImageFilters>) => void;
}

export function TransformControls({ filters, onUpdateFilters }: TransformControlsProps) {
  return (
    <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/50">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 md:mb-4">
        Transformations
      </h3>
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        <button
          onClick={() => onUpdateFilters({ rotation: (filters.rotation + 90) % 360 })}
          className="flex flex-col items-center justify-center gap-1 md:gap-1.5 p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 transition-all hover:shadow-lg"
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-[8px] md:text-[9px] font-bold">90° CW</span>
        </button>
        <button
          onClick={() => onUpdateFilters({ rotation: (filters.rotation - 90 + 360) % 360 })}
          className="flex flex-col items-center justify-center gap-1 md:gap-1.5 p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 transition-all hover:shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[8px] md:text-[9px] font-bold">90° CCW</span>
        </button>
        <button
          onClick={() => onUpdateFilters({ flipH: !filters.flipH })}
          className={`flex flex-col items-center justify-center gap-1 md:gap-1.5 p-2 md:p-3 rounded-lg md:rounded-xl border transition-all ${
            filters.flipH
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          <FlipHorizontal className="w-4 h-4" />
          <span className="text-[8px] md:text-[9px] font-bold">Mirror H</span>
        </button>
        <button
          onClick={() => onUpdateFilters({ flipV: !filters.flipV })}
          className={`flex flex-col items-center justify-center gap-1 md:gap-1.5 p-2 md:p-3 rounded-lg md:rounded-xl border transition-all ${
            filters.flipV
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          <FlipVertical className="w-4 h-4" />
          <span className="text-[8px] md:text-[9px] font-bold">Mirror V</span>
        </button>
      </div>
    </div>
  );
}
