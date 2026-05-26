import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";

import { phpAuth } from "@/lib/php-auth";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  // If already signed in, jump straight to admin.
  useEffect(() => {
    phpAuth.getSession().then(({ session }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  // Reset form when switching modes
  useEffect(() => {
    if (mode === "signin") {
      setName("");
      setShowValidationMessage(false);
    }
  }, [mode]);

  // Memoize onChange handlers to prevent excessive re-renders
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleModeChange = useCallback((newMode: "signin" | "signup") => {
    setMode(newMode);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await phpAuth.signInWithPassword(email, password);
        toast.success("Connecté");
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setShowValidationMessage(true);
          setLoading(false);
          return;
        }
        await phpAuth.signUp(email, password, name);
        toast.success("Compte créé");
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      const errorMessage = translateAuthError(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      toast.info("Google OAuth doit être configuré via l'API PHP sur le serveur");
      // TODO: Implement Google OAuth with PHP API
      // This would involve redirecting to the PHP API google_auth_url endpoint
    } catch (err: any) {
      const errorMessage = translateAuthError(err);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-sidebar p-3 sm:p-4">
      <Card className="w-full max-w-md p-4 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8">
          <img src={logo} alt="Ynuka Labs" className="h-12 sm:h-14 w-12 sm:w-14 rounded-full object-cover" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-center">
            {mode === "signin" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-xs text-muted-foreground text-center">Panel d'administration Ynuka Labs</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2 text-center leading-relaxed">
            {mode === "signin" 
              ? "Connectez-vous avec vos identifiants pour accéder au panel d'administration"
              : "Créez un nouveau compte pour accéder au panel d'administration"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 block">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={handleEmailChange}
                required
                className="pl-10 h-10 sm:h-11 rounded-full bg-muted/40 text-sm"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 block">
                Nom complet *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Jacques Masuruku"
                value={name}
                onChange={handleNameChange}
                required
                className="h-10 sm:h-11 rounded-full bg-muted/40 text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="pl-10 pr-10 h-10 sm:h-11 rounded-full bg-muted/40 text-sm"
              />
              <button
                type="button"
                onClick={handleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 z-10 pointer-events-auto"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "signup" ? "Minimum 6 caractères" : ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs pt-1 sm:pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <span className="text-xs">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="text-xs text-primary hover:underline text-left sm:text-right"
              onClick={() => toast.info("Contactez l'administrateur pour réinitialiser votre mot de passe.")}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-11 rounded-full bg-primary text-primary-foreground font-medium text-sm"
          >
            {loading ? "Chargement…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>

          <div className="relative my-3 text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">Ou</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={googleLogin}
            className="w-full h-10 sm:h-11 rounded-full gap-2 text-sm"
          >
            <GoogleIcon />
            <span>Continuer avec Google</span>
          </Button>

          <div className="pt-3 sm:pt-4 text-center">
            {mode === "signin" ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pas encore de compte ? {" "}
                <button 
                  type="button" 
                  className="text-primary font-semibold hover:underline" 
                  onClick={() => handleModeChange("signup")}
                >
                  Créer un compte
                </button>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Déjà un compte ? {" "}
                <button 
                  type="button" 
                  className="text-primary font-semibold hover:underline" 
                  onClick={() => handleModeChange("signin")}
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>

          {mode === "signup" && showValidationMessage && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">ℹ️ Champs manquants</p>
              <p>Remplissez tous les champs : email, nom et mot de passe. Un email de confirmation sera envoyé pour activer votre compte.</p>
            </div>
          )}
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
