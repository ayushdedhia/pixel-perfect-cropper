// Netlify Functions base path
const API_BASE = "/.netlify/functions";

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth-refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      accessToken = null;
      return false;
    }

    const data = await response.json();
    accessToken = data.accessToken;
    return true;
  } catch {
    accessToken = null;
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshAccessToken();
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // If unauthorized and we have/had a token, try to refresh
  if (response.status === 401 && !skipAuth) {
    const refreshed = await handleTokenRefresh();
    if (refreshed && accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Auth API
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  profilePictureUrl: string | null;
  isPremium: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface UserPreferences {
  id: string;
  defaultExportFormat: string;
  defaultQuality: number;
  theme: string;
}

export interface CreditWallet {
  balance: number;
  monthlyCreditsUsed: number;
  monthlyCreditsLimit: number;
  monthlyCreditsRemaining: number;
  daysUntilReset: number;
}

export interface ProfileResponse {
  user: AuthUser;
  preferences: UserPreferences | null;
  wallet: CreditWallet | null;
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string; // Only returned in demo mode
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api<AuthResponse>("/auth-register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    api<AuthResponse>("/auth-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  logout: () =>
    api<{ success: boolean }>("/auth-logout", {
      method: "POST",
    }),

  refresh: () =>
    api<AuthResponse>("/auth-refresh", {
      method: "POST",
      skipAuth: true,
    }),

  me: () => api<ProfileResponse>("/auth-me"),

  forgotPassword: (email: string) =>
    api<ForgotPasswordResponse>("/auth-forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  resetPassword: (token: string, password: string) =>
    api<ResetPasswordResponse>("/auth-reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    }),
};

export const userApi = {
  getProfile: () => api<ProfileResponse>("/user-profile"),

  updateProfile: (data: {
    name?: string;
    profilePictureUrl?: string | null;
    preferences?: Partial<UserPreferences>;
  }) =>
    api<ProfileResponse>("/user-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  upgradeToPremium: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    api<{ success: boolean; user: AuthUser }>("/user-premium", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUploadSignature: () => api<UploadSignatureResponse>("/upload-signature"),

  changePassword: (currentPassword: string, newPassword: string) =>
    api<ChangePasswordResponse>("/user-change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Payment API
export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  originalAmount: number;
  discount: number;
  discountSource: string | null;
  currency: string;
  keyId: string;
}

export const paymentApi = {
  createOrder: () =>
    api<CreateOrderResponse>("/payment-create-order", {
      method: "POST",
    }),
};

// Referral API
export interface ReferralCodeResponse {
  code: string;
  successfulReferrals: number;
  referredUsers: Array<{
    email: string;
    status: "pending" | "paid";
    createdAt: string;
  }>;
}

export interface ReferralValidateResponse {
  valid: boolean;
  discount: number;
  referrerName: string | null;
  message: string;
}

export interface ReferralApplyResponse {
  success: boolean;
  message: string;
  discount: number;
}

export const referralApi = {
  getMyCode: () => api<ReferralCodeResponse>("/referral-code"),

  validate: (code: string) =>
    api<ReferralValidateResponse>("/referral-validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  apply: (code: string) =>
    api<ReferralApplyResponse>("/referral-apply", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
};

// Credits API
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  priceInPaise: number;
  priceFormatted: string;
}

export interface CreditBalanceResponse {
  balance: number;
  monthlyCreditsUsed: number;
  monthlyCreditsLimit: number;
  monthlyCreditsRemaining: number;
  daysUntilReset: number;
  isPremium: boolean;
}

export interface CreditPacksResponse {
  packs: CreditPack[];
}

export interface CreditCostBreakdown {
  base: number;
  watermark: number;
  format: number;
}

export interface CreditCalculateResponse {
  cost: number;
  breakdown: CreditCostBreakdown;
  canAfford: boolean;
  currentBalance: number;
}

export interface CreditDeductResponse {
  success: boolean;
  creditsDeducted: number;
  newBalance: number;
  transactionId: string;
}

export interface CreditOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  packName: string;
  creditsToGrant: number;
}

export interface CreditVerifyResponse {
  success: boolean;
  creditsGranted: number;
  newBalance: number;
}

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
}

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export const creditsApi = {
  getBalance: () => api<CreditBalanceResponse>("/credits-balance"),

  getPacks: () => api<CreditPacksResponse>("/credits-packs"),

  calculateCost: (options: {
    format: ExportFormat;
    quality: number;
  }) =>
    api<CreditCalculateResponse>("/credits-calculate", {
      method: "POST",
      body: JSON.stringify(options),
    }),

  deduct: (options: {
    format: ExportFormat;
    quality: number;
    exportId?: string;
  }) =>
    api<CreditDeductResponse>("/credits-deduct", {
      method: "POST",
      body: JSON.stringify(options),
    }),

  createOrder: (packId: string) =>
    api<CreditOrderResponse>("/credits-create-order", {
      method: "POST",
      body: JSON.stringify({ packId }),
    }),

  verifyPurchase: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    packId: string;
  }) =>
    api<CreditVerifyResponse>("/credits-verify-purchase", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistory: (limit = 20, offset = 0) =>
    api<CreditHistoryResponse>(`/credits-history?limit=${limit}&offset=${offset}`),
};
