import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import logo from "@/assets/logo.jpg";

import { api, setToken, getApiUrl, setApiUrl, getToken, discoverApiUrl } from "@/lib/api";
import { toControlledString } from "@/lib/safe-input";
import { toast } from "sonner";

const REMEMBER_EMAIL_KEY = "ynuka_remember_email";
const OAUTH_HANDLED_KEY = "ynuka_oauth_handled";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Code d'autorisation manquant.",
  token_exchange_failed: "Échange du token Google échoué (vérifiez redirect URI + secret).",
  no_access_token: "Pas de jeton d'accès Google.",
  invalid_profile: "Profil Google invalide ou non vérifié.",
  not_authorized: "Ce compte Google n'est pas autorisé pour ce panel.",
  invalid_state: "Session OAuth expirée ou invalide. Réessayez.",
  curl_missing: "Extension PHP cURL absente sur le serveur.",
  db_schema: "Table admin_users incomplète (exécutez migrate-google-oauth.sql).",
  access_denied: "Connexion Google annulée.",
};

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getToken()) {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash.includes("token=") && !hash.includes("error=")) {
        throw redirect({ to: "/admin" });
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const oauthStarted = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [apiUrl, setUrl] = useState("");
  const [showApi, setShowApi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("email") || params.has("password")) {
      params.delete("email");
      params.delete("password");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = await discoverApiUrl();
      if (cancelled) return;
      if (found) {
        setApiUrl(found);
        setUrl(found);
        setApiStatus("ok");
      } else {
        setUrl(getApiUrl());
        setApiStatus("error");
        setShowApi(true);
      }
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || oauthStarted.current) return;

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const handled = sessionStorage.getItem(OAUTH_HANDLED_KEY);
    if (handled === hash) return;

    oauthStarted.current = true;
    sessionStorage.setItem(OAUTH_HANDLED_KEY, hash);

    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const error = params.get("error");

    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    if (token) {
      setToken(token);
      toast.success("Connecté via Google");
      navigate({ to: "/admin" });
      return;
    }

    if (error) {
      toast.error(GOOGLE_ERROR_MESSAGES[error] ?? `Erreur Google : ${error}`);
    }
  }, [ready, navigate]);

  const persistApiUrl = () => {
    try {
      setApiUrl(apiUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "URL de l'API invalide.";
      toast.error(msg);
      throw err;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error("Email et mot de passe requis.");
      return;
    }

    setLoading(true);
    try {
      persistApiUrl();
      const r = await api.login(trimmedEmail, password);
      if (!r?.token) {
        throw new Error("Réponse de connexion invalide (jeton manquant).");
      }
      setToken(r.token);
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      toast.success("Connecté");
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Identifiants invalides";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      persistApiUrl();
      const response = await api.googleAuthUrl();
      if (!response?.url) {
        throw new Error("URL Google OAuth manquante dans la réponse API.");
      }
      window.location.href = response.url;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Impossible de démarrer la connexion Google.";
      toast.error(msg);
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-sidebar p-4">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl text-center text-sm text-muted-foreground">
          Chargement…
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-sidebar p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src={logo} alt="Ynuka Labs" className="h-14 w-14 rounded-full object-cover" />
          <h1 className="text-2xl font-semibold tracking-tight">Account Login</h1>
          <p className="text-xs text-muted-foreground">Panel d'administration Ynuka Labs</p>
        </div>

        <form
          method="post"
          action="#"
          onSubmit={submit}
          className="space-y-3"
          noValidate
        >
          {apiStatus === "error" && (
            <p className="text-xs text-destructive rounded-md border border-destructive/30 bg-destructive/5 p-2">
              API injoignable. Vérifiez l&apos;URL ci-dessous ou ouvrez{" "}
              <a
                href={`${apiUrl || getApiUrl()}?action=ping`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                ?action=ping
              </a>{" "}
              dans le navigateur (JSON attendu).
            </p>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={toControlledString(email)}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="pl-10 h-11 rounded-full bg-muted/40"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Mot de passe"
              value={toControlledString(password)}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="pl-10 h-11 rounded-full bg-muted/40"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
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
            disabled={loading}
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
                value={toControlledString(apiUrl)}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://admin.ynukalabs.com/api/api.php"
                disabled={loading}
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
