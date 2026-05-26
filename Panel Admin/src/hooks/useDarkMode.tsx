import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem("panel-admin-dark-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = stored !== null ? stored === "true" : prefersDark;
    
    setIsDark(initialDark);
    applyTheme(initialDark);
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("panel-admin-dark-mode");
      if (stored === null) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isDark;
    setIsDark(newValue);
    localStorage.setItem("panel-admin-dark-mode", String(newValue));
    applyTheme(newValue);
  };

  return { isDark, toggleDarkMode };
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
