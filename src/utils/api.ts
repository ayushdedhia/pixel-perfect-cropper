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

export interface ProfileResponse {
  user: AuthUser;
  preferences: UserPreferences | null;
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
};

export const userApi = {
  getProfile: () => api<ProfileResponse>("/user-profile"),

  updateProfile: (data: { name?: string; preferences?: Partial<UserPreferences> }) =>
    api<ProfileResponse>("/user-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  upgradeToPremium: (paymentId: string) =>
    api<{ success: boolean; user: AuthUser }>("/user-premium", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    }),
};
