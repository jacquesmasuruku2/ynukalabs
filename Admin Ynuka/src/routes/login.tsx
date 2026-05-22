import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import logo from "@/assets/logo.jpg";

import { api, setToken, getApiUrl, setApiUrl } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [apiUrl, setUrl] = useState(getApiUrl());
  const [showApi, setShowApi] = useState(false);
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

  const googleLogin = () => {
    toast.info(
      "Connexion Google : à activer côté backend PHP (OAuth2). Pour l'instant, utilisez email/mot de passe.",
    );
  };

  return (
    <div className="min-h-screen grid place-items-center bg-sidebar p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src={logo} alt="Ynuka Labs" className="h-14 w-14 rounded-full object-cover" />
          <h1 className="text-2xl font-semibold tracking-tight">Account Login</h1>
          <p className="text-xs text-muted-foreground">Panel d'administration Ynuka Labs</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-11 rounded-full bg-muted/40"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 h-11 rounded-full bg-muted/40"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              <span>Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() =>
                toast.info("Contactez l'administrateur pour réinitialiser votre mot de passe.")
              }
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </Button>

          <div className="relative my-2 text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">Ou se connecter avec</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={googleLogin}
            className="w-full h-11 rounded-full gap-2"
          >
            <GoogleIcon />
            <span>Google</span>
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              onClick={() => setShowApi((v) => !v)}
            >
              {showApi ? "Masquer" : "Configurer"} l'URL de l'API
            </button>
            {showApi && (
              <Input
                value={apiUrl}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-domaine.com/api.php"
                className="mt-2 h-9 text-xs"
              />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.4 0-.5-.05-.9-.12-1.3H12z" />
    </svg>
  );
}
