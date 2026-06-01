import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { NotificationBell } from "@/components/NotificationBell";
import { api, getApiUrl } from "@/lib/api";
import { notifications } from "@/lib/notifications";
import { getActivities, type ActivityWithDate } from "@/lib/activities";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Activity, UserPlus, LogIn, MessageSquare, Bell } from "lucide-react";

export const Route = createFileRoute("/admin/diagnostic")({
  component: Diagnostic,
});

function Diagnostic() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"diagnostic" | "activities">("diagnostic");
  const [activities, setActivities] = useState<any[]>([]);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.ping());
    } catch (e: any) {
      setError(e.message || "Impossible de joindre l'API");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Charger les activités depuis l'API réelle
      const data = await getActivities("all", 50, 0);
      // Convertir les timestamps en objets Date
      const activitiesWithDates = data.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      setActivities(activitiesWithDates);
    } catch (e: any) {
      console.error("Erreur lors du chargement des activités:", e);
      setError(e.message || "Impossible de charger les activités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "diagnostic") {
      run();
    } else {
      loadActivities();
    }
  }, [view]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-600" />;
      case "register":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "notification":
        return <Bell className="h-4 w-4 text-amber-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
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

  const Row = ({ ok, label, value }: { ok: boolean; label: string; value?: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-3 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-destructive" />
        )}
        <span className="text-sm">{label}</span>
      </div>
      {value ? (
        <span className="text-xs text-muted-foreground font-mono text-right shrink-0">{value}</span>
      ) : null}
    </div>
  );

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title={view === "diagnostic" ? "Diagnostic backend" : "Activités du Panel"}
        description={view === "diagnostic" ? "État de l'API PHP et de la base de données" : "Historique des activités: connexions, enregistrements, messages et notifications"}
        showNotification={false}
        actions={
          <div className="flex gap-2 items-center">
            <NotificationBell />
            <Button
              onClick={() => setView(view === "diagnostic" ? "activities" : "diagnostic")}
              variant={view === "diagnostic" ? "outline" : "default"}
              size="sm"
            >
              {view === "diagnostic" ? (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Activités
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Diagnostic
                </>
              )}
            </Button>
            {view === "diagnostic" && (
              <Button onClick={run} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
            )}
            {view === "activities" && (
              <Button onClick={loadActivities} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
            )}
          </div>
        }
      />

      {view === "diagnostic" && (
        <Card className="panel-surface p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            URL de l'API
          </div>
          <code className="text-sm break-all">{getApiUrl()}</code>
        </Card>
      )}

      {view === "diagnostic" && error && (
        <Card className="panel-surface border-destructive/50 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="font-medium text-destructive">L'API ne répond pas</div>
              <div className="text-muted-foreground">{error}</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Vérifiez que <code>api.php</code> est bien uploadé sur le serveur</li>
                <li>Vérifiez l'URL dans <strong>Paramètres</strong></li>
                <li>Ouvrez l'URL ci-dessus dans un navigateur — vous devriez voir du JSON</li>
                <li>Si erreur CORS : vérifiez <code>ALLOWED_ORIGIN</code> dans <code>api.php</code></li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {view === "diagnostic" && data && (
        <>
          <Card className="panel-surface p-6">
            <h2 className="font-semibold mb-3">Configuration PHP</h2>
            <Row ok label="API joignable" value={`PHP ${data.php_version}`} />
            <Row
              ok={data.config?.db_user_set}
              label="Identifiants MySQL renseignés"
              value={data.config?.db_user_set ? "✓" : "À configurer"}
            />
            <Row
              ok={data.config?.jwt_secret_set}
              label="JWT_SECRET défini"
              value={data.config?.jwt_secret_set ? "✓" : "À configurer"}
            />
          </Card>

          <Card className="panel-surface p-6">
            <h2 className="font-semibold mb-3">Base de données</h2>
            <Row
              ok={data.db === "ok"}
              label={`Connexion à ${data.config?.db_name}`}
              value={data.db === "ok" ? "Connecté" : data.db_error}
            />
            {data.db === "ok" && (
              <>
                <Row
                  ok={data.admin_users_table}
                  label="Table admin_users existe"
                  value={
                    data.admin_users_table
                      ? `${data.admin_users_count} compte(s)`
                      : "Exécutez setup.sql"
                  }
                />
                <Row
                  ok={(data.tables_missing?.length ?? 0) === 0}
                  label="Tables métier (13 attendues)"
                  value={`${(data.tables_expected?.length ?? 0) - (data.tables_missing?.length ?? 0)} / ${data.tables_expected?.length ?? 0}`}
                />
              </>
            )}
          </Card>

          {data.tables_missing?.length > 0 && (
            <Card className="panel-surface border-amber-500/50 bg-amber-500/5 p-6">
              <h2 className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                Tables manquantes
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.tables_missing.map((t: string) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {data.tables_found?.length > 0 && (
            <Card className="panel-surface p-6">
              <h2 className="font-semibold mb-2">Tables détectées dans la base</h2>
              <div className="flex flex-wrap gap-2">
                {data.tables_found.map((t: string) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {view === "activities" && (
        <>
          {loading ? (
            <Card className="panel-surface p-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </Card>
          ) : activities.length === 0 ? (
            <Card className="panel-surface p-6">
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune activité récente</p>
              </div>
            </Card>
          ) : (
            <Card className="panel-surface p-6">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(new Date(activity.timestamp))}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="panel-surface p-6">
            <h3 className="font-semibold mb-3">Filtres d'activités</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <LogIn className="h-3 w-3 mr-1" />
                Connexions
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <UserPlus className="h-3 w-3 mr-1" />
                Inscriptions
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <MessageSquare className="h-3 w-3 mr-1" />
                Messages
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <Bell className="h-3 w-3 mr-1" />
                Notifications
              </Badge>
            </div>
          </Card>
        </>
      )}
    </PageShell>
  );
}
