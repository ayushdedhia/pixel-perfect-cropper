import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logoSvg from "../assets/brand/logo.svg";
import logoWhite from "../assets/brand/logo-monochrome.svg";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-pink-500" />

        {/* Animated blur shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
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
          {/* Large crop frame - top right */}
          <div className="absolute top-16 right-12 w-40 h-32 opacity-20">
            {/* Top-left corner */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
            {/* Top-right corner */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
          </div>

          {/* Small crop frame - bottom left */}
          <div className="absolute bottom-32 left-12 w-24 h-24 opacity-15 rotate-6">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
          </div>

          {/* 16:9 aspect ratio frame */}
          <div className="absolute top-1/3 right-1/4 w-32 h-18 border border-white/15 border-dashed" />

          {/* 1:1 aspect ratio frame */}
          <div className="absolute bottom-1/4 right-16 w-20 h-20 border border-white/10" />

          {/* Rule of thirds grid */}
          <div className="absolute top-48 left-16 w-28 h-20 opacity-20">
            <div className="absolute left-1/3 top-0 w-px h-full bg-white" />
            <div className="absolute left-2/3 top-0 w-px h-full bg-white" />
            <div className="absolute top-1/3 left-0 w-full h-px bg-white" />
            <div className="absolute top-2/3 left-0 w-full h-px bg-white" />
          </div>

          {/* Image placeholder mockups */}
          <div className="absolute bottom-48 right-8 w-16 h-12 bg-white/5 border border-white/20 rounded">
            <div className="absolute inset-2 border border-dashed border-white/20 rounded-sm" />
          </div>

          {/* Adjustment slider mockup */}
          <div className="absolute top-2/3 left-8 opacity-20">
            <div className="w-24 h-1 bg-white/40 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full -mt-1 ml-16" />
            </div>
          </div>

          {/* Floating crosshairs */}
          <div className="absolute top-1/4 left-1/4 opacity-15">
            <div className="w-px h-6 bg-white absolute left-1/2 -translate-x-1/2" />
            <div className="w-6 h-px bg-white absolute top-1/2 -translate-y-1/2" />
          </div>

          {/* Small scattered elements */}
          <div className="absolute top-20 left-1/3 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute bottom-40 left-1/4 w-3 h-3 border border-white/20 rotate-45" />
          <div className="absolute top-1/2 right-8 text-white/15 text-2xl font-light">+</div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoWhite} alt="PixelPerfect Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-white">PixelPerfect</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Crop, edit, and<br />
            <span className="text-white/80">perfect your images</span>
          </h2>

          <p className="text-lg text-white/70 max-w-md">
            Professional image cropping with powerful filters, transformations, and export options. All in your browser.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {["Smart Cropping", "Live Filters", "Multiple Formats", "No Watermarks"].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={logoSvg} alt="PixelPerfect Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-white">PixelPerfect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400">
              Enter your credentials to access your account
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
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-500/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
