import { Check, Copy, Download, Settings2, Sparkles } from "lucide-react";
import type { ExportConfig, ExportFormat } from "../../types";

interface ExportSettingsProps {
  exportConfig: ExportConfig;
  isDownloading: boolean;
  isCopying: boolean;
  canExport: boolean;
  isPremium: boolean;
  onExportConfigChange: (config: Partial<ExportConfig>) => void;
  onDownload: () => void;
  onCopyToClipboard: () => void;
  onShowPremiumModal: () => void;
}

export function ExportSettings({
  exportConfig,
  isDownloading,
  isCopying,
  canExport,
  isPremium,
  onExportConfigChange,
  onDownload,
  onCopyToClipboard,
  onShowPremiumModal,
}: ExportSettingsProps) {
  return (
    <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800 sticky bottom-0">
      <div className="flex items-center gap-2 mb-3 md:mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        <Settings2 className="w-3.5 h-3.5" /> Export Configuration
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 md:mb-2">
            Format
          </label>
          <select
            value={exportConfig.format}
            onChange={(e) => onExportConfigChange({ format: e.target.value as ExportFormat })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 md:py-2 px-2 md:px-3 text-[11px] md:text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 md:mb-2">
            Quality
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={100}
              value={exportConfig.quality}
              disabled={exportConfig.format === "image/png"}
              onChange={(e) => onExportConfigChange({ quality: Number(e.target.value) })}
              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none accent-indigo-500 disabled:opacity-10 cursor-pointer"
            />
            <span className="text-[10px] font-bold text-indigo-400 w-8 font-mono">
              {exportConfig.quality}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-2 md:gap-3">
        <button
          onClick={onDownload}
          disabled={isDownloading || !canExport}
          className="flex-1 md:flex-none w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-white text-slate-950 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:scale-95 shadow-xl shadow-white/5 active:scale-95"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">{isDownloading ? "Processing..." : "Export & Save"}</span>
          <span className="sm:hidden">{isDownloading ? "..." : "Save"}</span>
        </button>
        <button
          onClick={onCopyToClipboard}
          disabled={isCopying || !canExport}
          className="flex-1 md:flex-none w-full flex items-center justify-center gap-2 md:gap-3 py-3 bg-slate-800 text-white rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-30 text-xs active:scale-95"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">{isCopying ? "Copying..." : "Copy as PNG"}</span>
          <span className="sm:hidden">{isCopying ? "..." : "Copy"}</span>
        </button>
      </div>

      {/* Premium status / Upgrade button */}
      {isPremium ? (
        <div className="flex items-center justify-center gap-1.5 mt-3 text-emerald-400 text-[10px] font-medium">
          <Check className="w-3 h-3" />
          <span>Premium</span>
        </div>
      ) : (
        <button
          onClick={onShowPremiumModal}
          className="w-full flex items-center justify-center gap-1.5 mt-2 text-slate-500 hover:text-indigo-400 text-[10px] font-medium transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Remove Watermark - ₹299</span>
        </button>
      )}
    </div>
  );
}
