import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiUrl, setApiUrl } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const [url, setUrl] = useState(getApiUrl());
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration de la connexion à l'API</p>
      </div>
      <Card className="p-6 space-y-4">
        <div className="grid gap-1.5">
          <Label>URL de l'API PHP</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            Ex. <code>https://ynukalabs.com/api.php</code>
          </p>
        </div>
        <Button
          onClick={() => {
            setApiUrl(url);
            toast.success("Enregistré");
          }}
        >
          Enregistrer
        </Button>
      </Card>
    </div>
  );
}
