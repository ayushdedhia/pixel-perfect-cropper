import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import logoWhite from "../assets/brand/logo-monochrome.svg";
import { authApi } from "../utils/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      setIsSubmitted(true);
      // For demo purposes, capture the reset URL
      if (response.resetUrl) {
        setResetUrl(response.resetUrl);
      }
      toast.success("Check your email for reset instructions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500 via-orange-500 to-red-500" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-orange-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-red-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Key/lock decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Lock icon representation */}
          <div className="absolute top-20 right-16 opacity-20">
            <div className="w-16 h-12 border-2 border-white rounded-lg" />
            <div className="w-8 h-8 border-2 border-white rounded-full mx-auto -mt-4 border-b-0" />
          </div>

          {/* Email envelope shapes */}
          <div className="absolute bottom-32 left-16 w-20 h-14 border border-white/20 rounded">
            <div className="absolute inset-0 flex items-start justify-center pt-1">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20" />
            </div>
          </div>

          {/* Floating shapes */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-white/20 rounded-full" />
          <div className="absolute top-1/2 right-20 text-white/15 text-3xl font-light">@</div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoWhite} alt="PixelPerfect Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-white">PixelPerfect</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Forgot your<br />
            <span className="text-white/80">password?</span>
          </h2>

          <p className="text-lg text-white/70 max-w-md">
            No worries! Enter your email and we'll send you instructions to reset your password.
          </p>
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

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
                <p className="text-slate-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all backdrop-blur-sm"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-amber-500/50 disabled:to-orange-500/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Send reset link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-amber-400" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-slate-400 mb-6">
                We've sent password reset instructions to <span className="text-white">{email}</span>
              </p>

              {/* Demo mode: show the reset link */}
              {resetUrl && (
                <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Demo mode - Reset link:</p>
                  <Link
                    to={resetUrl}
                    className="text-amber-400 hover:text-amber-300 text-sm break-all"
                  >
                    {window.location.origin}{resetUrl}
                  </Link>
                </div>
              )}

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  setResetUrl(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-slate-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
