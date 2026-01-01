/**
 * PixelPerfect Brand Theme
 * Premium & Elegant design system
 */

export const theme = {
  // Primary brand colors - Deep violet with premium feel
  colors: {
    // Primary violet spectrum
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6", // Main brand color
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    // Premium gold accent
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
    },
    // Refined background tones
    surface: {
      900: "#0f0d1a", // Deepest - main bg
      800: "#1a1625", // Cards
      700: "#252033", // Elevated
      600: "#322b47", // Hover states
    },
  },

  // Gradient presets
  gradients: {
    // Premium brand gradient
    brand: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)",
    // Subtle surface gradient
    surface: "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)",
    // Button hover glow
    glow: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
    // Premium gold shimmer
    premium: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
  },

  // Refined shadows
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
    md: "0 4px 12px rgba(0, 0, 0, 0.3)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.4)",
    glow: "0 0 20px rgba(139, 92, 246, 0.2)",
    glowStrong: "0 0 30px rgba(139, 92, 246, 0.3)",
  },

  // Animation durations
  transitions: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
} as const;

// Tailwind class presets for consistent styling
export const tw = {
  // Primary button
  btnPrimary: `
    bg-gradient-to-r from-violet-600 via-violet-500 to-purple-500
    hover:from-violet-500 hover:via-violet-400 hover:to-purple-400
    active:from-violet-700 active:via-violet-600 active:to-purple-600
    disabled:from-violet-600/40 disabled:via-violet-500/40 disabled:to-purple-500/40
    text-white font-semibold
    shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30
    transition-all duration-200
  `,
  // Secondary button
  btnSecondary: `
    bg-slate-800/60 hover:bg-slate-700/60 active:bg-slate-600/60
    border border-slate-600/50 hover:border-slate-500/50
    text-slate-200 hover:text-white font-medium
    transition-all duration-200
  `,
  // Card styling
  card: `
    bg-slate-900/70 backdrop-blur-sm
    border border-slate-700/40
    rounded-2xl
    shadow-lg shadow-black/20
  `,
  // Input styling
  input: `
    bg-slate-800/40 border border-slate-700/50
    rounded-xl px-4 py-3
    text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50
    transition-all duration-200
  `,
  // Premium badge
  premiumBadge: `
    bg-gradient-to-r from-amber-500 to-yellow-400
    text-amber-950 font-semibold
    px-2 py-0.5 rounded-full text-xs
  `,
} as const;
