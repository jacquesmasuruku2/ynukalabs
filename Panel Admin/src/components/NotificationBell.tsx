import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bell, X, Check, LogIn, UserPlus, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: "login" | "register" | "message" | "notification" | "alert";
  user: string;
  message: string;
  timestamp: Date;
  read: boolean;
  details?: string;
  metadata?: Record<string, any>;
}

// Event emitter pour les notifications globales
const notificationEvents = new EventTarget();

export function notify(notification: Omit<Notification, "id" | "read">) {
  const event = new CustomEvent("notification", {
    detail: {
      ...notification,
      id: Date.now(),
      read: false,
    },
  });
  notificationEvents.dispatchEvent(event);
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Écouter les nouvelles notifications
  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;
      setNotifications((prev) => [customEvent.detail, ...prev].slice(0, 50)); // Garder max 50 notifications
    };

    notificationEvents.addEventListener("notification", handleNotification);

    return () => {
      notificationEvents.removeEventListener("notification", handleNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-600" />;
      case "register":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "notification":
        return <Bell className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return timestamp.toLocaleDateString("fr-FR");
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full z-50 w-80 mt-2 shadow-lg max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Les notifications apparaîtront ici lors des activités du panel</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors relative group",
                        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {notification.user}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-border text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    // Naviguer vers la page des activités
                    window.location.href = "/admin/diagnostic";
                  }}
                >
                  Voir toutes les activités
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
