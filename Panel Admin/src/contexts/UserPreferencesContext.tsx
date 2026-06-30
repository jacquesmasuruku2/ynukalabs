import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type SidebarPosition = "left" | "right";
type Theme = "light" | "dark" | "system";

interface UserPreferences {
  sidebarPosition: SidebarPosition;
  theme: Theme;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updateSidebarPosition: (position: SidebarPosition) => void;
  updateTheme: (theme: Theme) => void;
  updateNotificationsEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = "ynuka_admin_preferences";

const defaultPreferences: UserPreferences = {
  sidebarPosition: "left",
  theme: "dark",
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }, [preferences]);

  const updateSidebarPosition = (position: SidebarPosition) => {
    setPreferences((prev) => ({ ...prev, sidebarPosition: position }));
  };

  const updateTheme = (theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const updateNotificationsEnabled = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, notificationsEnabled: enabled }));
  };

  const completeOnboarding = () => {
    setPreferences((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updateSidebarPosition,
        updateTheme,
        updateNotificationsEnabled,
        completeOnboarding,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return context;
}
