import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Crown, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface UserMenuProps {
  onOpenPremiumModal: () => void;
}

export function UserMenu({ onOpenPremiumModal }: UserMenuProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-semibold hover:scale-105 transition-all duration-200 ring-2 ring-slate-700/50 hover:ring-violet-500/40"
      >
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-600 via-violet-500 to-purple-500 flex items-center justify-center">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-slate-700/40 shadow-2xl shadow-black/60 overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-4 bg-gradient-to-br from-violet-950/30 to-slate-900/50 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-violet-500/20">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 via-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            {user.isPremium && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-400/20">
                <Crown size={14} className="text-amber-400" />
                <span className="text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Premium Member</span>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="p-2">
            {!user.isPremium && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPremiumModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-linear-to-r from-amber-500/10 to-yellow-500/10 text-amber-400 hover:from-amber-500/20 hover:to-yellow-500/20 transition-all duration-200"
              >
                <Crown size={16} />
                Upgrade to Premium
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          {/* Sign out */}
          <div className="p-2 border-t border-slate-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
