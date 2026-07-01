import { NotificationPanel } from "@/components/NotificationPanel";
import { useNotifications } from "@/contexts/NotificationContext";

export function NotificationPanelWrapper() {
  const { showNotifications, closeNotifications } = useNotifications();

  return (
    <NotificationPanel
      isOpen={showNotifications}
      onClose={closeNotifications}
    />
  );
}
