import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { api, getApiUrl } from "@/lib/api";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/diagnostic")({
  component: Diagnostic,
});

function Diagnostic() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    run();
  }, []);

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
        title="Diagnostic backend"
        description="État de l'API PHP et de la base de données"
        actions={
          <Button onClick={run} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        }
      />

      <Card className="panel-surface p-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          URL de l'API
        </div>
        <code className="text-sm break-all">{getApiUrl()}</code>
      </Card>

      {error && (
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

      {data && (
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
    </PageShell>
  );
}
