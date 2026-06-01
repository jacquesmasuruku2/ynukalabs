import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("panel-admin-theme-mode") as ThemeMode;
    return stored || "system";
  });

  // Get effective dark mode based on theme mode
  const getEffectiveDarkMode = (): boolean => {
    if (themeMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return themeMode === "dark";
  };

  // Initialize on mount
  useEffect(() => {
    const effectiveDark = getEffectiveDarkMode();
    setIsDark(effectiveDark);
    applyTheme(effectiveDark);
  }, [themeMode]);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  const toggleDarkMode = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isDark;
    setThemeMode(newValue ? "dark" : "light");
    localStorage.setItem("panel-admin-theme-mode", newValue ? "dark" : "light");
    setIsDark(newValue);
    applyTheme(newValue);
  };

  const setThemeModeWithStorage = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("panel-admin-theme-mode", mode);
    const effectiveDark = mode === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : mode === "dark";
    setIsDark(effectiveDark);
    applyTheme(effectiveDark);
  };

  return { isDark, toggleDarkMode, themeMode, setThemeMode: setThemeModeWithStorage };
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
