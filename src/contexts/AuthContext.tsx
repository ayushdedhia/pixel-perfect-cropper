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
} from "../utils/api";

interface AuthState {
  user: AuthUser | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    preferences: null,
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
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      setAccessToken(null);
      setState({
        user: null,
        preferences: null,
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
      isLoading: false,
      isAuthenticated: true,
    });

    // Fetch full profile with preferences
    try {
      const profile = await authApi.me();
      setState((prev) => ({
        ...prev,
        preferences: profile.preferences,
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
        isLoading: false,
        isAuthenticated: true,
      });
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
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
