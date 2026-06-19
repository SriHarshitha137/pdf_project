"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  googleLoginUser,
  getMe,
  type AuthUser,
} from "./authApi";

const TOKEN_KEY = "pdfflow_token";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleAccessToken: string) => Promise<void>;
  register: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for stored token and validate it
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      getMe()
        .then((u) => setUser(u))
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);

    const me = await getMe();
    setUser(me);
  }, []);

  const loginWithGoogle = useCallback(async (googleAccessToken: string) => {
    const res = await googleLoginUser(googleAccessToken);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    const me = await getMe();
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const newUser = await registerUser(email, password);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
