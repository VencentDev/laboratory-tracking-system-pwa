"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "my-app-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function getResolvedTheme(theme: Theme): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  const resolvedTheme = getResolvedTheme(theme);
  const root = window.document.documentElement;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  media.addEventListener("change", handleMediaChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    media.removeEventListener("change", handleMediaChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme: Theme = useSyncExternalStore(subscribe, getStoredTheme, (): Theme => "system");
  const resolvedTheme = getResolvedTheme(theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
