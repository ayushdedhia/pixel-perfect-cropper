import { History, RotateCcw } from "lucide-react";
import { FILTERS_INITIAL_STATE } from "../../constants";
import type { ImageFilters } from "../../types";

interface AdjustmentControlsProps {
  filters: ImageFilters;
  historyLength: number;
  onUpdateFilters: (filters: Partial<ImageFilters>) => void;
  onUndo: () => void;
}

const SLIDERS = [
  { id: "brightness", max: 200, step: 1 },
  { id: "contrast", max: 200, step: 1 },
  { id: "saturation", max: 200, step: 1 },
  { id: "blur", max: 20, step: 0.5 },
] as const;

export function AdjustmentControls({ filters, historyLength, onUpdateFilters, onUndo }: AdjustmentControlsProps) {
  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Adjustments
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={onUndo}
            disabled={historyLength === 0}
            className="p-1.5 rounded-md bg-slate-800 hover:text-white border border-slate-700 disabled:opacity-20 transition-all"
            title="Undo"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateFilters(FILTERS_INITIAL_STATE)}
            className="p-1.5 rounded-md bg-slate-800 hover:text-white border border-slate-700 transition-all"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3 md:gap-y-5">
        {SLIDERS.map((slider) => (
          <div key={slider.id}>
            <div className="flex justify-between mb-1 md:mb-1.5 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <label>{slider.id}</label>
              <span className="text-indigo-400 font-mono">
                {filters[slider.id as keyof ImageFilters] as number}
                {slider.id === "blur" ? "px" : "%"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={slider.max}
              step={slider.step}
              value={filters[slider.id as keyof ImageFilters] as number}
              onChange={(e) => onUpdateFilters({ [slider.id]: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4 md:mt-8">
        <button
          onClick={() => onUpdateFilters({ grayscale: !filters.grayscale })}
          className={`py-2 md:py-2.5 rounded-lg border text-[9px] md:text-[10px] font-black transition-all ${
            filters.grayscale
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-slate-800 border-slate-700 text-slate-500"
          }`}
        >
          Grayscale
        </button>
        <button
          onClick={() => onUpdateFilters({ sepia: !filters.sepia })}
          className={`py-2 md:py-2.5 rounded-lg border text-[9px] md:text-[10px] font-black transition-all ${
            filters.sepia
              ? "bg-amber-900/40 border-amber-800/50 text-amber-200"
              : "bg-slate-800 border-slate-700 text-slate-500"
          }`}
        >
          Sepia Tone
        </button>
      </div>
    </div>
  );
}
