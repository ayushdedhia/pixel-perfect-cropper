import { useState, useEffect, useRef } from "react";
import { X, Shield, Check } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  isUnlocked: boolean;
}

const ADMIN_PASSCODE = "pixel2024";

export function AdminModal({ isOpen, onClose, onUnlock, isUnlocked }: AdminModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode("");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      onUnlock();
      setPasscode("");
      setError(false);
    } else {
      setError(true);
      setPasscode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-100">Admin Access</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4">
          {isUnlocked ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-green-400 font-medium">Admin mode enabled</p>
              <p className="text-slate-400 text-sm mt-1">Watermark will be skipped on export</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-400 mb-2">
                Enter admin passcode
              </label>
              <input
                ref={inputRef}
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  error ? "border-red-500" : "border-slate-600"
                }`}
                placeholder="••••••••"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">Incorrect passcode</p>
              )}
              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
              >
                Unlock
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
