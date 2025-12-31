import { Info, X, LogIn } from "lucide-react";
import logoSvg from "../assets/brand/logo.svg";
import { useAuth } from "../contexts/AuthContext";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  image: string | null;
  imageWidth?: number;
  imageHeight?: number;
  onClear: () => void;
  onOpenAuthModal: () => void;
  onOpenPremiumModal: () => void;
}

export function Header({
  image,
  imageWidth,
  imageHeight,
  onClear,
  onOpenAuthModal,
  onOpenPremiumModal,
}: HeaderProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="h-14 md:h-16 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 bg-slate-900/50 backdrop-blur-md z-30">
      <div className="flex items-center gap-2 select-none">
        <img src={logoSvg} alt="PixelCropper Logo" className="w-8 h-8 md:w-10 md:h-10" />
        <h1 className="text-base md:text-xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          <span className="hidden sm:inline">PixelPerfect </span>Cropper
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {image && (
          <>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <Info className="w-3 h-3" /> {imageWidth}x{imageHeight} Source
            </div>
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}

        {!isLoading && (
          isAuthenticated ? (
            <UserMenu onOpenPremiumModal={onOpenPremiumModal} />
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )
        )}
      </div>
    </header>
  );
}
