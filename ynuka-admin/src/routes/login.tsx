import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { api, setToken, getApiUrl, setApiUrl } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiUrl, setUrl] = useState(getApiUrl());
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(apiUrl);
    setLoading(true);
    try {
      const r = await api.login(email, password);
      setToken(r.token);
      toast.success("Connecté");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-sidebar p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary grid place-items-center text-primary-foreground font-bold">
            Y
          </div>
          <div>
            <h1 className="font-semibold">Ynuka Labs</h1>
            <p className="text-xs text-muted-foreground">Panel d'administration</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="apiurl">URL de l'API</Label>
            <Input
              id="apiurl"
              value={apiUrl}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://votre-domaine.com/api.php"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
