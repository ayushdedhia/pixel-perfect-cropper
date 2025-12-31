import { Eye, EyeOff, Loader2, Check, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import logoWhite from "../assets/brand/logo-monochrome.svg";
import { authApi } from "../utils/api";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (!passwordChecks.length) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!passwordChecks.match) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-500" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-violet-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Key/shield decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Shield shape */}
          <div className="absolute top-20 right-20 w-20 h-24 border-2 border-white/20 rounded-t-full" />

          {/* Key shapes */}
          <div className="absolute bottom-32 left-20 opacity-20">
            <div className="w-6 h-6 border-2 border-white rounded-full" />
            <div className="w-2 h-10 bg-white ml-2" />
            <div className="w-4 h-2 bg-white ml-2 -mt-4" />
            <div className="w-4 h-2 bg-white ml-2 mt-2" />
          </div>

          {/* Checkmark circle */}
          <div className="absolute top-1/3 left-1/4 w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
            <Check size={20} className="text-white/20" />
          </div>

          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute top-1/2 right-16 text-white/15 text-3xl font-light">*</div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoWhite} alt="PixelPerfect Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-white">PixelPerfect</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Create a new<br />
            <span className="text-white/80">secure password</span>
          </h2>

          <p className="text-lg text-white/70 max-w-md">
            Choose a strong password to keep your account safe. Make sure it's at least 6 characters.
          </p>

          <div className="mt-8 space-y-3">
            {["Use a mix of letters and numbers", "Avoid common words", "Don't reuse passwords"].map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/80 text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={logoSvg} alt="PixelPerfect Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-white">PixelPerfect</span>
          </div>

          {!isSuccess ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
                <p className="text-slate-400">
                  Enter your new password below to complete the reset.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all backdrop-blur-sm"
                      placeholder="At least 6 characters"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all backdrop-blur-sm"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                {/* Password requirements */}
                {password.length > 0 && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-violet-400' : 'text-slate-500'}`}>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordChecks.length ? 'border-violet-400 bg-violet-400/20' : 'border-slate-600'}`}>
                        {passwordChecks.length && <Check size={10} />}
                      </div>
                      6+ characters
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-violet-400' : 'text-red-400'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordChecks.match ? 'border-violet-400 bg-violet-400/20' : 'border-red-400'}`}>
                          {passwordChecks.match && <Check size={10} />}
                        </div>
                        Passwords match
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-linear-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:from-violet-600/50 disabled:to-purple-500/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      Reset password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-violet-400" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">Password reset!</h1>
              <p className="text-slate-400 mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-linear-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                Sign in to your account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
