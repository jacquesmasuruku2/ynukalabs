import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, CheckCheck, Trash2, Bell, LogIn, UserPlus, MessageSquare, AlertCircle, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getActivities, markAsRead as markAsReadApi, markAllAsRead as markAllAsReadApi, deleteActivity, deleteAllActivities, type ActivityWithDate } from "@/lib/activities";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<ActivityWithDate[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<ActivityWithDate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log("Chargement des notifications avec filtre:", filter);
      const data = await getActivities(filter, 50, 0);
      console.log("Notifications reçues:", data);
      // Convertir les timestamps en objets Date
      const notificationsWithDates = data.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      setNotifications(notificationsWithDates);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markAsRead = async (id: number) => {
    try {
      await markAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const handleNotificationClick = (notification: ActivityWithDate) => {
    setSelectedNotification(notification);
    // Marquer comme lu si ce n'est pas déjà le cas
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const closeDetailView = () => {
    setSelectedNotification(null);
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Erreur lors du marquage de toutes comme lues:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await deleteActivity(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const clearAll = async () => {
    try {
      await deleteAllActivities();
      setNotifications([]);
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-5 w-5 text-blue-600" />;
      case "register":
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "notification":
        return <Bell className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "register":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "message":
        return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
      case "alert":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      case "notification":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800";
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
    return timestamp.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <Card className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl rounded-none border-l border-border/50 bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border/50 bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 pb-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs"
              >
                Toutes
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="text-xs"
              >
                Non lues
              </Button>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Tout lire
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Tout effacer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <Bell className="relative h-16 w-16 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {filter === "unread"
                  ? "Vous avez lu toutes vos notifications"
                  : "Les notifications apparaîtront ici lors des activités du panel (connexions, inscriptions, messages, etc.)"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                    getNotificationColor(notification.type),
                    !notification.read && "shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {notification.user}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge
                            variant="default"
                            className="shrink-0 text-[10px] px-1.5 py-0.5 h-5"
                          >
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="h-7 w-7 rounded-full bg-background/80 hover:bg-background"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="h-7 w-7 rounded-full bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 border-t border-border/50 bg-background p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                window.location.href = "/admin/diagnostic";
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Voir toutes les activités
            </Button>
          </div>
        )}
      </Card>

      {/* Vue détaillée de la notification */}
      {selectedNotification && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
            onClick={closeDetailView}
          />
          <Card className="fixed right-0 top-0 h-full w-full max-w-lg z-[70] shadow-2xl rounded-none border-l border-border/50 bg-background overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Détails de la notification</h2>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(selectedNotification.timestamp)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeDetailView}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Type et utilisateur */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      selectedNotification.type === "alert" && "border-red-500 text-red-500",
                      selectedNotification.type === "login" && "border-blue-500 text-blue-500",
                      selectedNotification.type === "register" && "border-green-500 text-green-500",
                      selectedNotification.type === "message" && "border-purple-500 text-purple-500"
                    )}
                  >
                    {selectedNotification.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">par</span>
                  <span className="text-sm font-medium text-foreground">{selectedNotification.user}</span>
                </div>

                {/* Message principal */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-base font-medium text-foreground mb-2">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Détails étendus */}
                {selectedNotification.details && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Description détaillée</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedNotification.details}
                    </p>
                  </div>
                )}

                {/* Métadonnées */}
                {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Informations supplémentaires</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div
                          key={key}
                          className="p-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <p className="text-xs text-muted-foreground capitalize mb-1">{key}</p>
                          <p className="text-sm font-medium text-foreground">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp complet */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Créée le {selectedNotification.timestamp.toLocaleString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-border/50 bg-background p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    closeDetailView();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={closeDetailView}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
