// Credit system constants
export const CREDIT_CONSTANTS = {
  // Monthly allowances
  FREE_MONTHLY_CREDITS: 50,
  PREMIUM_MONTHLY_CREDITS: 150,

  // Export costs
  BASE_EXPORT_COST: 2,
  PREMIUM_FORMAT_COST: 1, // Additional for WebP/high-quality JPEG

  // Credit packs (in paise)
  DEFAULT_PACKS: [
    { name: "Noob", credits: 50, bonusCredits: 0, priceInPaise: 4900, sortOrder: 1 },
    { name: "Value", credits: 100, bonusCredits: 0, priceInPaise: 9900, sortOrder: 2 },
    { name: "Rich", credits: 200, bonusCredits: 0, priceInPaise: 14900, sortOrder: 3 },
    { name: "Deal Breaker", credits: 500, bonusCredits: 0, priceInPaise: 34900, sortOrder: 4 },
  ],
};

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export interface ExportCostOptions {
  format: ExportFormat;
  quality: number;
}

export interface ExportCostBreakdown {
  total: number;
  breakdown: {
    base: number;
    format: number;
  };
}

/**
 * Calculate the credit cost for an export operation
 * Note: Watermark removal is a premium-only feature, not purchasable with credits
 */
export function calculateExportCost(options: ExportCostOptions): ExportCostBreakdown {
  const { format, quality } = options;

  const base = CREDIT_CONSTANTS.BASE_EXPORT_COST;

  // Premium format cost (WebP or high-quality JPEG > 90%)
  const formatCost = format === "image/webp" || (format === "image/jpeg" && quality > 90)
    ? CREDIT_CONSTANTS.PREMIUM_FORMAT_COST
    : 0;

  const total = base + formatCost;

  return {
    total,
    breakdown: {
      base,
      format: formatCost,
    },
  };
}

/**
 * Check if a monthly reset is needed
 */
export function needsMonthlyReset(lastReset: Date): boolean {
  const now = new Date();
  const resetDate = new Date(lastReset);

  // Reset if we're in a different month or year
  return (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  );
}

/**
 * Get days until next monthly reset
 */
export function getDaysUntilReset(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the monthly credit limit based on premium status
 */
export function getMonthlyLimit(isPremium: boolean): number {
  return isPremium
    ? CREDIT_CONSTANTS.PREMIUM_MONTHLY_CREDITS
    : CREDIT_CONSTANTS.FREE_MONTHLY_CREDITS;
}

/**
 * Format price in paise to rupees string
 */
export function formatPriceInRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}
