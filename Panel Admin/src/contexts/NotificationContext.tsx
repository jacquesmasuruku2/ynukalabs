import { createContext, useContext, useState, ReactNode } from "react";

interface NotificationContextType {
  showNotifications: boolean;
  toggleNotifications: () => void;
  closeNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotifications, toggleNotifications, closeNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
