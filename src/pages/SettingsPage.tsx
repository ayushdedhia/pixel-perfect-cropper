import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Monitor,
  Moon,
  Share2,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import { ProfilePictureCropper } from "../components/ProfilePictureCropper";
import { UserMenu } from "../components/UserMenu";
import { useAuth } from "../contexts/AuthContext";
import { useTheme, type Theme } from "../contexts/ThemeContext";
import { referralApi, userApi, type ReferralCodeResponse } from "../utils/api";
import { uploadToCloudinary } from "../utils/cloudinary";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Referral state
  const [referralData, setReferralData] = useState<ReferralCodeResponse | null>(null);
  const [isLoadingReferral, setIsLoadingReferral] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const data = await referralApi.getMyCode();
        setReferralData(data);
      } catch (error) {
        console.error("Failed to fetch referral code:", error);
      } finally {
        setIsLoadingReferral(false);
      }
    };
    fetchReferralCode();
  }, []);

  const handleCopyCode = async () => {
    if (!referralData?.code) return;
    try {
      await navigator.clipboard.writeText(referralData.code);
      setCopiedCode(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleShareCode = async () => {
    if (!referralData?.code) return;
    const shareText = `Use my referral code ${referralData.code} to get 10% off on PixelCropper Premium!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "PixelCropper Referral",
          text: shareText,
        });
      } catch {
        // User cancelled or share failed, ignore
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || "?";

  const handlePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Open the cropper modal
    setCropperFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCroppedPicture = async (croppedBlob: Blob) => {
    setCropperFile(null);
    setIsUploadingPicture(true);

    try {
      const result = await uploadToCloudinary(croppedBlob);
      await userApi.updateProfile({ profilePictureUrl: result.secure_url });
      updateUser({ profilePictureUrl: result.secure_url });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload picture");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleCropperCancel = () => {
    setCropperFile(null);
  };

  const handleRemovePicture = async () => {
    setIsUploadingPicture(true);
    try {
      await userApi.updateProfile({ profilePictureUrl: null });
      updateUser({ profilePictureUrl: null });
      toast.success("Profile picture removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove picture");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSavingProfile(true);
    try {
      await userApi.updateProfile({ name: name.trim() });
      updateUser({ name: name.trim() });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await userApi.updateProfile({ preferences: { theme: newTheme } });
    } catch {
      // Ignore error, theme is already applied locally
    }
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Monitor size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Navbar - consistent across pages */}
      <header className="h-14 md:h-16 border-b border-slate-800/80 flex items-center justify-between px-3 md:px-6 bg-slate-900/70 backdrop-blur-xl z-30 relative">
        <Link
          to="/"
          className="flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity"
        >
          <img src={logoSvg} alt="PixelCropper Logo" className="w-8 h-8 md:w-9 md:h-9" />
          <h1 className="text-base md:text-lg font-bold">
            <span className="bg-linear-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
              <span className="hidden sm:inline">PixelPerfect </span>Cropper
            </span>
          </h1>
        </Link>

        <UserMenu onOpenPremiumModal={() => {}} />
      </header>

      {/* Background gradient effects - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-48 h-48 sm:w-96 sm:h-96 sm:-top-40 sm:-left-40 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 sm:w-80 sm:h-80 sm:-right-20 bg-fuchsia-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-48 h-48 sm:w-96 sm:h-96 sm:-bottom-40 sm:left-1/3 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content - scrollable on mobile */}
      <div className="relative z-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-8">
        {/* Page Title */}
        <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="p-2.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-600/50 text-slate-400 hover:text-white transition-all border border-slate-700/50"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h1>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Card */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">
                Profile
              </h2>

              {/* Avatar - centered on mobile */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
                <div className="relative shrink-0">
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-violet-500/30"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-violet-600 via-violet-500 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-xl font-semibold">
                      {initials}
                    </div>
                  )}
                  {isUploadingPicture && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 size={24} className="sm:w-5 sm:h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureSelect}
                    className="hidden"
                    disabled={isUploadingPicture}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPicture}
                    className="flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 active:bg-violet-500/40 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    <Camera size={16} className="sm:w-3.5 sm:h-3.5" />
                    {user?.profilePictureUrl ? "Change" : "Upload"}
                  </button>
                  {user?.profilePictureUrl && (
                    <button
                      onClick={handleRemovePicture}
                      disabled={isUploadingPicture}
                      className="flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 size={16} className="sm:w-3.5 sm:h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Email form */}
              <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-3 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-base sm:text-sm"
                    placeholder="Your name"
                    disabled={isSavingProfile}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-3 sm:py-2.5 bg-slate-800/30 border border-slate-700/30 rounded-xl text-slate-500 cursor-not-allowed text-base sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile || name === user?.name}
                  className="w-full py-3 sm:py-2.5 bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 active:from-violet-700 active:to-violet-600 disabled:from-violet-600/50 disabled:to-violet-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-sm"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={18} className="sm:w-4 sm:h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>

            {/* Security Card */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">
                Security
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-slate-300 mb-1.5"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-3 sm:py-2.5 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-base sm:text-sm"
                      placeholder="Enter current password"
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300 active:text-white transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} className="sm:w-4 sm:h-4" />
                      ) : (
                        <Eye size={18} className="sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-slate-300 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-3 sm:py-2.5 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-base sm:text-sm"
                      placeholder="Enter new password"
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300 active:text-white transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} className="sm:w-4 sm:h-4" />
                      ) : (
                        <Eye size={18} className="sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-3 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-base sm:text-sm"
                    placeholder="Confirm new password"
                    disabled={isChangingPassword}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isChangingPassword || !currentPassword || !newPassword || !confirmPassword
                  }
                  className="w-full py-3 sm:py-2.5 bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 disabled:bg-slate-700/30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-sm border border-slate-600/50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={18} className="sm:w-4 sm:h-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preferences Card - Full Width */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Preferences
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">Theme</p>
                  <p className="text-xs text-slate-500">Choose your preferred appearance</p>
                </div>
                <div className="grid grid-cols-3 sm:flex gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all ${
                        theme === option.value
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                          : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300 active:bg-slate-600/50"
                      }`}
                    >
                      {option.icon}
                      <span className="hidden xs:inline sm:inline">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Program Card - Full Width */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5 flex items-center gap-2">
              <Gift size={20} className="text-violet-400" />
              Referral Program
            </h2>

            {isLoadingReferral ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-violet-400" />
              </div>
            ) : (
              <>
                {/* User's referral code with copy button */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Referral Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={referralData?.code || ""}
                      readOnly
                      className="flex-1 px-3 py-3 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white font-mono text-base sm:text-sm tracking-wider"
                    />
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <button
                      onClick={handleShareCode}
                      className="px-4 py-2.5 bg-violet-500/20 hover:bg-violet-500/30 active:bg-violet-500/40 border border-violet-500/30 rounded-xl text-violet-400 hover:text-violet-300 transition-all"
                      title="Share code"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Referral stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {referralData?.successfulReferrals || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">Successful Referrals</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                      {(referralData?.successfulReferrals || 0) >= 3
                        ? "Earned!"
                        : `${3 - (referralData?.successfulReferrals || 0)} more`}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">Free Premium</p>
                  </div>
                </div>

                {/* Benefits explanation */}
                <div className="p-3 sm:p-4 bg-linear-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
                  <p className="text-sm text-slate-300 mb-2">
                    <span className="font-semibold text-white">Share your code</span> and both you
                    and your friend get{" "}
                    <span className="text-emerald-400 font-semibold">10% off</span> Premium!
                  </p>
                  <p className="text-sm text-slate-400">
                    Get <span className="text-violet-400 font-semibold">3 friends</span> to go
                    Premium and earn{" "}
                    <span className="text-emerald-400 font-semibold">Free Premium</span> for
                    yourself!
                  </p>
                </div>

                {/* Referred users list */}
                {referralData && referralData.referredUsers.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Your Referrals</h3>
                    <div className="space-y-2">
                      {referralData.referredUsers.map((referredUser, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg border border-slate-700/30"
                        >
                          <span className="text-sm text-slate-400 font-mono">
                            {referredUser.email}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              referredUser.status === "paid"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {referredUser.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Cropper Modal */}
      {cropperFile && (
        <ProfilePictureCropper
          imageFile={cropperFile}
          onSave={handleCroppedPicture}
          onCancel={handleCropperCancel}
        />
      )}
    </div>
  );
}
