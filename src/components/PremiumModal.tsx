import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  const handleGetPremium = () => {
    // Placeholder - will be replaced with Gumroad link
    toast.info("Coming soon! Payment integration in progress.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black text-white">Remove Watermark</h2>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Export your images without the "Made with PixelCropper" watermark. One-time purchase, forever access.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">₹299</span>
            <span className="text-slate-500 text-sm">one-time</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">No subscription, no hidden fees</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGetPremium}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Get Premium
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
