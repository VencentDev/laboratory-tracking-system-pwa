"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  closeToolkeeperSession,
  createToolkeeperSession,
  verifyAdminLogin,
  type ToolkeeperSessionInput,
} from "@/features/auth/lib/auth-repository";
import type { AuthSession } from "@/features/auth/types";

const AUTH_SESSION_STORAGE_KEY = "auth_session";

type AuthContextValue = {
  session: AuthSession;
  isLoading: boolean;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  loginToolkeeper: (data: ToolkeeperSessionInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function parseStoredSession(value: string | null): AuthSession {
  if (!value) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(value) as AuthSession;

    if (parsedValue?.role === "admin" || parsedValue?.role === "toolkeeper") {
      return parsedValue;
    }
  } catch {
    return null;
  }

  return null;
}

function writeSession(session: Exclude<AuthSession, null>) {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setSession(parseStoredSession(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key !== AUTH_SESSION_STORAGE_KEY) {
        return;
      }

      setSession(parseStoredSession(event.newValue));
    }

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginAdmin = useCallback(async (username: string, password: string) => {
    const isValidLogin = await verifyAdminLogin(username, password);

    if (!isValidLogin) {
      return false;
    }

    const adminSession = { role: "admin" } as const;
    writeSession(adminSession);
    setSession(adminSession);

    return true;
  }, []);

  const loginToolkeeper = useCallback(async (data: ToolkeeperSessionInput) => {
    const sessionId = await createToolkeeperSession(data);
    const toolkeeperSession = {
      role: "toolkeeper",
      sessionId,
      ...data,
    } as const;

    writeSession(toolkeeperSession);
    setSession(toolkeeperSession);
  }, []);

  const logout = useCallback(async () => {
    if (session?.role === "toolkeeper") {
      await closeToolkeeperSession(session.sessionId);
    }

    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    setSession(null);
    router.push("/");
  }, [router, session]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      loginAdmin,
      loginToolkeeper,
      logout,
    }),
    [isLoading, loginAdmin, loginToolkeeper, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
