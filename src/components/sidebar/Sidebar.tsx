import type { ExportConfig, ImageFilters } from "../../types";
import { AdjustmentControls } from "./AdjustmentControls";
import { CropSettings } from "./CropSettings";
import { ExportSettings } from "./ExportSettings";
import { TransformControls } from "./TransformControls";

interface SidebarProps {
  aspect: number | undefined;
  filters: ImageFilters;
  exportConfig: ExportConfig;
  historyLength: number;
  isDownloading: boolean;
  isCopying: boolean;
  canExport: boolean;
  isPremium: boolean;
  onAspectChange: (aspect: number | undefined) => void;
  onCircularChange: (circular: boolean) => void;
  onUpdateFilters: (filters: Partial<ImageFilters>) => void;
  onUndo: () => void;
  onExportConfigChange: (config: Partial<ExportConfig>) => void;
  onDownload: () => void;
  onCopyToClipboard: () => void;
  onShowPremiumModal: () => void;
}

export function Sidebar({
  aspect,
  filters,
  exportConfig,
  historyLength,
  isDownloading,
  isCopying,
  canExport,
  isPremium,
  onAspectChange,
  onCircularChange,
  onUpdateFilters,
  onUndo,
  onExportConfigChange,
  onDownload,
  onCopyToClipboard,
  onShowPremiumModal,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col z-20 overflow-y-auto shadow-2xl max-h-[50vh] lg:max-h-none">
      <CropSettings
        aspect={aspect}
        exportConfig={exportConfig}
        onAspectChange={onAspectChange}
        onCircularChange={onCircularChange}
      />
      <TransformControls filters={filters} onUpdateFilters={onUpdateFilters} />
      <AdjustmentControls
        filters={filters}
        historyLength={historyLength}
        onUpdateFilters={onUpdateFilters}
        onUndo={onUndo}
      />
      <ExportSettings
        exportConfig={exportConfig}
        isDownloading={isDownloading}
        isCopying={isCopying}
        canExport={canExport}
        isPremium={isPremium}
        onExportConfigChange={onExportConfigChange}
        onDownload={onDownload}
        onCopyToClipboard={onCopyToClipboard}
        onShowPremiumModal={onShowPremiumModal}
      />
    </aside>
  );
}
