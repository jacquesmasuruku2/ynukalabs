import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-6 max-w-3xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Settings2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Paramètres
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez votre expérience du panel admin
          </p>
        </div>
      </div>

      {/* Section Apparence */}
      <Card className="p-6 space-y-6 border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-950">
        <div className="border-b border-primary/10 pb-4">
          <h2 className="text-xl font-bold text-foreground">Apparence</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalisez le thème du panel
          </p>
        </div>

        {/* Mode sombre */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-semibold text-foreground">Mode sombre</p>
              <p className="text-xs text-muted-foreground">
                {isDark ? "Actuellement activé" : "Actuellement désactivé"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => toggleDarkMode()}
            variant={isDark ? "default" : "outline"}
            className={
              isDark
                ? "rounded-full bg-primary hover:bg-primary/90 text-white"
                : "rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
            }
          >
            {isDark ? "Désactiver" : "Activer"}
          </Button>
        </div>
      </Card>

      {/* Section API */}
      <Card className="p-6 space-y-4 border-0 shadow-sm rounded-2xl bg-white dark:bg-slate-950">
        <div className="border-b border-primary/10 pb-4">
          <h2 className="text-xl font-bold text-foreground">Configuration API</h2>
          <p className="text-sm text-muted-foreground mt-1">
            URL de connexion à l'API PHP
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="api-url" className="font-bold text-foreground">
            URL de l'API PHP
          </Label>
          <Input
            id="api-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ynukalabs.com/api.php"
            className="rounded-full h-11 bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Exemple: <code className="bg-muted px-2 py-1 rounded">https://ynukalabs.com/api.php</code>
          </p>
        </div>

        <Button
          onClick={() => {
            setApiUrl(url);
            toast.success("Configuration API enregistrée");
          }}
          className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium h-11 mt-4"
        >
          Enregistrer la configuration
        </Button>
      </Card>
    </div>
  );
}
