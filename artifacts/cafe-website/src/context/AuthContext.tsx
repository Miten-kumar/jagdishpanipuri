import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("admin_token"));
    return () => setAuthTokenGetter(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (stored) {
      setToken(stored);
      fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data) setUser(data); else { localStorage.removeItem("admin_token"); setToken(null); } })
        .catch(() => { localStorage.removeItem("admin_token"); setToken(null); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("admin_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
