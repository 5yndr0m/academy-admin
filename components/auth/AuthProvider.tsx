"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types";

interface AuthContextType {
  user: string | null;
  role: UserRole | null;
  login: (data: { token: string; username: string; role: UserRole }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read localStorage once at init — avoids setState inside useEffect
function getStoredAuth(): { user: string | null; role: UserRole | null } {
  if (typeof window === "undefined") return { user: null, role: null };
  const user = localStorage.getItem("academy_user");
  const role = localStorage.getItem("academy_role") as UserRole | null;
  const token = localStorage.getItem("auth_token");
  if (user && role && token) return { user, role };
  return { user: null, role: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(() => getStoredAuth().user);
  const [role, setRole] = useState<UserRole | null>(() => getStoredAuth().role);

  const router = useRouter();
  const pathname = usePathname();

  // Only routing logic in the effect — no setState
  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, pathname, router]);

  const login = (data: { token: string; username: string; role: UserRole }) => {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("academy_user", data.username);
    localStorage.setItem("academy_role", data.role);
    setUser(data.username);
    setRole(data.role);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("academy_user");
    localStorage.removeItem("academy_role");
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
