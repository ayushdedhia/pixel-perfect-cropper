// Referral system constants
export const REFERRAL_CONSTANTS = {
  BASE_PREMIUM_AMOUNT: 29900, // Rs 299 in paise
  DISCOUNT_PERCENT: 10,
  DISCOUNT_AMOUNT: 2990, // Rs 29.90 in paise
  DISCOUNTED_AMOUNT: 26910, // Rs 269.10 in paise
  REFERRALS_FOR_FREE_PREMIUM: 3,
  CODE_PREFIX: "PIXEL-",
};

/**
 * Generates a unique referral code in format "PIXEL-XXXXXX"
 * Uses alphanumeric characters excluding confusing ones (0, O, 1, I, L)
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${REFERRAL_CONSTANTS.CODE_PREFIX}${code}`;
}

/**
 * Masks an email for privacy display
 * "john@example.com" -> "j***@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Validates referral code format
 */
export function isValidReferralCodeFormat(code: string): boolean {
  return /^PIXEL-[A-Z0-9]{6}$/.test(code.toUpperCase());
}
