import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  authApi,
  setAccessToken,
  type AuthUser,
  type UserPreferences,
  type CreditWallet,
} from "../utils/api";

interface AuthState {
  user: AuthUser | null;
  preferences: UserPreferences | null;
  wallet: CreditWallet | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  updateWallet: (wallet: Partial<CreditWallet>) => void;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    preferences: null,
    wallet: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.refresh();
      setAccessToken(response.accessToken);

      const profile = await authApi.me();
      setState({
        user: profile.user,
        preferences: profile.preferences,
        wallet: profile.wallet,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      setAccessToken(null);
      setState({
        user: null,
        preferences: null,
        wallet: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAccessToken(response.accessToken);

    setState({
      user: response.user,
      preferences: null,
      wallet: null,
      isLoading: false,
      isAuthenticated: true,
    });

    // Fetch full profile with preferences and wallet
    try {
      const profile = await authApi.me();
      setState((prev) => ({
        ...prev,
        preferences: profile.preferences,
        wallet: profile.wallet,
      }));
    } catch {
      // Ignore error, we have the basic user info
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const response = await authApi.register(email, password, name);
      setAccessToken(response.accessToken);

      setState({
        user: response.user,
        preferences: null,
        wallet: null,
        isLoading: false,
        isAuthenticated: true,
      });

      // Fetch full profile with wallet
      try {
        const profile = await authApi.me();
        setState((prev) => ({
          ...prev,
          preferences: profile.preferences,
          wallet: profile.wallet,
        }));
      } catch {
        // Ignore error
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setState({
        user: null,
        preferences: null,
        wallet: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  const updateWallet = useCallback((updates: Partial<CreditWallet>) => {
    setState((prev) => ({
      ...prev,
      wallet: prev.wallet ? { ...prev.wallet, ...updates } : null,
    }));
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const profile = await authApi.me();
      setState((prev) => ({
        ...prev,
        wallet: profile.wallet,
      }));
    } catch {
      // Ignore error
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        updateWallet,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
