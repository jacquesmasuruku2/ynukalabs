import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
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
  const { isDark, toggleDarkMode, themeMode, setThemeMode } = useDarkMode();

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

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choisissez le thème d'affichage du panel
          </p>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => setThemeMode("light")}
              variant={themeMode === "light" ? "default" : "outline"}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Clair</span>
            </Button>

            <Button
              onClick={() => setThemeMode("dark")}
              variant={themeMode === "dark" ? "default" : "outline"}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Sombre</span>
            </Button>

            <Button
              onClick={() => setThemeMode("system")}
              variant={themeMode === "system" ? "default" : "outline"}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs">Système</span>
            </Button>
          </div>

          {themeMode === "system" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Monitor className="h-4 w-4" />
              <span>
                Le thème suit les préférences de votre système ({isDark ? "sombre" : "clair"})
              </span>
            </div>
          )}
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
