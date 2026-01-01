import logoSvg from "../assets/brand/logo.svg";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
      {/* Logo with pulse animation */}
      <div className="relative mb-6">
        <img
          src={logoSvg}
          alt="PixelCropper"
          className="w-16 h-16 animate-pulse"
        />
        {/* Glow effect */}
        <div className="absolute inset-0 w-16 h-16 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Brand name */}
      <h1 className="text-xl font-bold mb-6">
        <span className="bg-linear-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
          PixelPerfect Cropper
        </span>
      </h1>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-linear-to-r from-violet-600 to-purple-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}
