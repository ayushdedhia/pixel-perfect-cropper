import { useState, useRef, useEffect } from "react";
import { LogOut, Crown, Settings, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface UserMenuProps {
  onOpenPremiumModal: () => void;
}

export function UserMenu({ onOpenPremiumModal }: UserMenuProps) {
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <span className="text-sm text-neutral-200 hidden sm:block max-w-[100px] truncate">
          {user.name || user.email.split("@")[0]}
        </span>
        {user.isPremium && (
          <Crown size={14} className="text-yellow-500 hidden sm:block" />
        )}
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl py-1 z-50">
          <div className="px-4 py-3 border-b border-neutral-700">
            <p className="text-sm font-medium text-white truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            {user.isPremium && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                <Crown size={10} />
                Premium
              </span>
            )}
          </div>

          <div className="py-1">
            {!user.isPremium && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPremiumModal();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-yellow-500 hover:bg-neutral-700/50 transition-colors"
              >
                <Crown size={16} />
                Upgrade to Premium
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                toast.info("Profile settings coming soon!");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          <div className="border-t border-neutral-700 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-neutral-700/50 transition-colors"
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
