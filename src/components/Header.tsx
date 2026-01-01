import { Info, X } from "lucide-react";
import logoSvg from "../assets/brand/logo.svg";
import { CreditDisplay } from "./CreditDisplay";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  image: string | null;
  imageWidth?: number;
  imageHeight?: number;
  onClear: () => void;
  onOpenPremiumModal: () => void;
}

export function Header({
  image,
  imageWidth,
  imageHeight,
  onClear,
  onOpenPremiumModal,
}: HeaderProps) {
  return (
    <header className="h-14 md:h-16 border-b border-slate-800/80 flex items-center justify-between px-3 md:px-6 bg-slate-900/70 backdrop-blur-xl z-30">
      <div className="flex items-center gap-2.5 select-none">
        <img src={logoSvg} alt="PixelCropper Logo" className="w-8 h-8 md:w-9 md:h-9" />
        <h1 className="text-base md:text-lg font-bold">
          <span className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
            <span className="hidden sm:inline">PixelPerfect </span>Cropper
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {image && (
          <>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
              <Info className="w-3 h-3 text-violet-400" /> {imageWidth}x{imageHeight}
            </div>
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}

        <CreditDisplay />
        <UserMenu onOpenPremiumModal={onOpenPremiumModal} />
      </div>
    </header>
  );
}
