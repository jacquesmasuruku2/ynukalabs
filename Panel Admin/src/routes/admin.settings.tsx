import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { FormField } from "@/components/ui/form-field";
import { getApiUrl, setApiUrl } from "@/lib/api";
import { useDarkMode } from "@/hooks/useDarkMode";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const [url, setUrl] = useState(getApiUrl());
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title="Paramètres"
        description="Apparence et connexion à l'API PHP"
      />

      <Card className="panel-surface p-6 md:p-8">
        <div className="space-y-1 border-b border-border/50 pb-5 mb-6">
          <h2 className="text-lg font-semibold text-foreground">Apparence</h2>
          <p className="text-sm text-muted-foreground">Thème du panel admin</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">Mode sombre</p>
              <p className="text-xs text-muted-foreground">
                {isDark ? "Actuellement activé" : "Actuellement désactivé"}
              </p>
            </div>
          </div>
          <Button onClick={() => toggleDarkMode()} variant={isDark ? "default" : "outline"}>
            {isDark ? "Désactiver" : "Activer"}
          </Button>
        </div>
      </Card>

      <Card className="panel-surface p-6 md:p-8">
        <div className="space-y-1 border-b border-border/50 pb-5 mb-6">
          <h2 className="text-lg font-semibold text-foreground">Configuration API</h2>
          <p className="text-sm text-muted-foreground">URL de connexion à l'API PHP</p>
        </div>

        <div className="form-stack">
          <FormField
            label="URL de l'API PHP"
            hint={
              <>
                Exemple :{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://admin.ynukalabs.com/api/api.php
                </code>
              </>
            }
          >
            <Input
              id="api-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://admin.ynukalabs.com/api/api.php"
            />
          </FormField>

          <Button
            onClick={() => {
              setApiUrl(url);
              toast.success("Configuration API enregistrée");
            }}
          >
            Enregistrer la configuration
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
