import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import logoWhite from "../assets/brand/logo-monochrome.svg";
import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
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
      await register(email, password, name || undefined);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-500" />

        {/* Animated blur shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-teal-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Crop-related decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large crop frame - bottom right */}
          <div className="absolute bottom-20 right-8 w-36 h-28 opacity-20">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white" />
          </div>

          {/* Small crop frame - top left */}
          <div className="absolute top-24 left-16 w-20 h-20 opacity-15 -rotate-3">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
          </div>

          {/* 4:3 aspect ratio frame */}
          <div className="absolute top-1/4 right-20 w-28 h-21 border border-white/15 border-dashed" />

          {/* Circle crop indicator */}
          <div className="absolute bottom-1/3 left-20 w-24 h-24 border-2 border-white/15 rounded-full border-dashed" />

          {/* Rule of thirds grid - larger */}
          <div className="absolute bottom-48 left-8 w-32 h-24 opacity-15">
            <div className="absolute left-1/3 top-0 w-px h-full bg-white" />
            <div className="absolute left-2/3 top-0 w-px h-full bg-white" />
            <div className="absolute top-1/3 left-0 w-full h-px bg-white" />
            <div className="absolute top-2/3 left-0 w-full h-px bg-white" />
          </div>

          {/* Image card stack mockup */}
          <div className="absolute top-16 right-16 opacity-20">
            <div className="w-14 h-10 bg-white/10 border border-white/30 rounded absolute -rotate-6" />
            <div className="w-14 h-10 bg-white/10 border border-white/30 rounded absolute rotate-3 translate-x-2 translate-y-1" />
          </div>

          {/* Zoom/magnifier indicator */}
          <div className="absolute top-1/2 right-12 opacity-15">
            <div className="w-8 h-8 border-2 border-white rounded-full" />
            <div className="w-4 h-0.5 bg-white absolute -bottom-1 -right-2 rotate-45" />
          </div>

          {/* Color palette dots */}
          <div className="absolute bottom-24 left-1/3 flex gap-2 opacity-25">
            <div className="w-3 h-3 bg-white rounded-full" />
            <div className="w-3 h-3 bg-white/70 rounded-full" />
            <div className="w-3 h-3 bg-white/40 rounded-full" />
          </div>

          {/* Crosshairs */}
          <div className="absolute top-2/3 right-1/3 opacity-15">
            <div className="w-px h-8 bg-white absolute left-1/2 -translate-x-1/2" />
            <div className="w-8 h-px bg-white absolute top-1/2 -translate-y-1/2" />
          </div>

          {/* Small accents */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute bottom-1/2 right-8 text-white/15 text-xl font-light">+</div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoWhite} alt="PixelPerfect Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-white">PixelPerfect</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Start creating<br />
            <span className="text-white/80">amazing images</span>
          </h2>

          <p className="text-lg text-white/70 max-w-md">
            Join thousands of creators who trust PixelPerfect for their image editing needs. Free to start.
          </p>

          {/* Benefits list */}
          <div className="mt-8 space-y-4">
            {[
              "Unlimited image uploads",
              "All cropping tools included",
              "Export in multiple formats",
              "No credit card required",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={logoSvg} alt="PixelPerfect Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-white">PixelPerfect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create your account
            </h1>
            <p className="text-slate-400">
              Get started with PixelPerfect today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                placeholder="Your name"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
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
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                placeholder="Confirm your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {/* Password requirements */}
            {password.length > 0 && (
              <div className="flex flex-wrap gap-3 text-sm">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordChecks.length ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600'}`}>
                    {passwordChecks.length && <Check size={10} />}
                  </div>
                  6+ characters
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordChecks.match ? 'border-emerald-400 bg-emerald-400/20' : 'border-red-400'}`}>
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
              className="w-full py-3 mt-2 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-600/50 disabled:to-emerald-500/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
