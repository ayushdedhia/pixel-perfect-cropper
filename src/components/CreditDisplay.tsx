import { Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export function CreditDisplay() {
  const navigate = useNavigate();
  const { wallet, isAuthenticated } = useAuth();

  if (!isAuthenticated || !wallet) return null;

  return (
    <button
      onClick={() => navigate("/store")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-violet-500/30 transition-all duration-200 group"
      title="Buy more credits"
    >
      <Coins size={16} className="text-amber-400 group-hover:text-amber-300" />
      <span className="text-sm font-semibold text-white">{wallet.balance}</span>
    </button>
  );
}
