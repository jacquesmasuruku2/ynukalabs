import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { phpAuth } from "@/lib/php-auth";
import { toast } from "sonner";
import { translateAuthError, translateGoogleOAuthError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

/**
 * Route definition required by TanStack Router infrastructure.
 * This ensures strict typing across the dynamic application routes.
 */
export const Route = createFileRoute("/login")({
  loader: async ({ location }) => {
    const hash =
      location.hash ||
      (typeof window !== "undefined" ? window.location.hash : "");
    const result = await phpAuth.handleOAuthCallbackFromHash(hash);
    if (result.redirectTo) {
      throw redirect({ to: result.redirectTo });
    }
    return { oauthError: result.oauthError ?? null };
  },
  component: LoginPage,
});

const FIELD_ICON_SLOT = "w-10 shrink-0 sm:w-12";
const FIELD_HEIGHT = "h-11 sm:h-12";

/**
 * Interface definition for authentication fields component props
 */
type AuthFieldProps = {
  id: string;
  icon: LucideIcon;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  invalid?: boolean;
  rightAdornment?: React.ReactNode;
};

/**
 * AuthField Component - Custom encapsulated input element.
 * Provides micro-interactions, custom icons, validation states, and web accessibility features.
 */
function AuthField({
  id,
  icon: Icon,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  invalid = false,
  rightAdornment,
}: AuthFieldProps) {
  return (
    <div className="flex w-full flex-col space-y-2 max-md:space-y-2.5">
      <label
        htmlFor={id}
        className="pl-0.5 text-xs font-semibold tracking-wide text-slate-600 max-md:text-[13px]"
      >
        {label}
      </label>

      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80 transition-all duration-200 max-md:shadow-sm",
          "focus-within:ring-2 focus-within:ring-[#2a5298]/30 focus-within:shadow-md md:bg-slate-50 md:focus-within:bg-white",
          invalid && "ring-rose-400/80 bg-rose-50/20 focus-within:ring-rose-500 focus-within:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]",
        )}
      >
        <div className={cn("flex w-full items-stretch", FIELD_HEIGHT)}>
          {/* Left Icon decoration box */}
          <div
            className={cn(
              FIELD_ICON_SLOT,
              "flex items-center justify-center text-slate-400 transition-colors duration-200 group-focus-within:text-[#2a5298]",
            )}
            aria-hidden
          >
            <Icon className="h-[18px] w-[18px] stroke-[2]" />
          </div>

          {/* Native raw HTML input wrapper with optimized performance fields */}
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            minLength={minLength}
            autoComplete={autoComplete}
            aria-label={label}
            aria-invalid={invalid || undefined}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-2 text-base font-medium text-slate-800 outline-none sm:py-3 sm:pr-3 sm:text-sm",
              "placeholder:font-normal placeholder:text-slate-400/60",
              "autofill:shadow-[inset_0_0_0_1000px_#f4f8f7] autofill:[-webkit-text-fill-color:#334155]",
              "group-focus-within:autofill:shadow-[inset_0_0_0_1000px_#ffffff]",
              rightAdornment && "pr-1",
            )}
          />

          {/* Conditional layout slot for action items like password toggles */}
          {rightAdornment ? (
            <div className={cn(FIELD_ICON_SLOT, "flex items-center justify-center")}>
              {rightAdornment}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type AuthModeToggleProps = {
  mode: "signin" | "signup";
  onChange: (mode: "signin" | "signup") => void;
  variant?: "panel" | "form";
};

/** Boutons Connexion / Inscription toujours au même endroit, côte à côte */
function AuthModeToggle({ mode, onChange, variant = "panel" }: AuthModeToggleProps) {
  const isPanel = variant === "panel";

  if (isPanel) {
    const panelBtn =
      "flex-1 rounded-full border-2 px-4 py-3.5 text-xs font-bold transition-all duration-200 min-h-[50px] flex items-center justify-center";
    return (
      <div className="flex w-full max-w-[300px] gap-2.5" role="tablist" aria-label="Choisir connexion ou inscription">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => onChange("signin")}
          className={cn(
            panelBtn,
            mode === "signin"
              ? "border-white bg-white text-[#1e3c72] shadow-lg"
              : "border-white/80 text-white hover:bg-white/10",
          )}
        >
          Se connecter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => onChange("signup")}
          className={cn(
            panelBtn,
            mode === "signup"
              ? "border-white bg-white text-[#1e3c72] shadow-lg"
              : "border-white/80 text-white hover:bg-white/10",
          )}
        >
          S&apos;inscrire
        </button>
      </div>
    );
  }

  const formBtn =
    "flex-1 rounded-full py-3 text-sm font-semibold transition-all duration-200 min-h-[48px] flex items-center justify-center";

  return (
    <div
      className="flex w-full rounded-2xl bg-slate-100/90 p-1.5 ring-1 ring-slate-200/90"
      role="tablist"
      aria-label="Choisir connexion ou inscription"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signin"}
        onClick={() => onChange("signin")}
        className={cn(
          formBtn,
          mode === "signin" ? "bg-white text-[#2a5298] shadow-sm" : "text-slate-500 hover:text-slate-700",
        )}
      >
        Connexion
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        onClick={() => onChange("signup")}
        className={cn(
          formBtn,
          mode === "signup" ? "bg-white text-[#2a5298] shadow-sm" : "text-slate-500 hover:text-slate-700",
        )}
      >
        Inscription
      </button>
    </div>
  );
}

/** En-tête marque mobile : logo centré, titre Ynuka Labs juste en dessous */
function MobileBrandHeader() {
  return (
    <header className="mb-8 flex w-full flex-col items-center md:hidden">
      <div className="relative flex w-full justify-center pt-2">
        {/* Logo glow effect background */}
        <div
          className="absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[#2a5298]/8 blur-3xl"
          aria-hidden
        />
        {/* Logo container with enhanced styling */}
        <div className="relative flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="Logo Ynuka Labs"
            className="relative h-24 w-24 rounded-3xl border-2 border-slate-200/50 bg-white object-cover shadow-[0_12px_32px_rgba(42,82,152,0.15)]"
            style={{
              clipPath: "polygon(25% 6%, 75% 6%, 94% 50%, 75% 94%, 25% 94%, 6% 50%)",
            }}
          />
          {/* Title positioned below logo */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-center text-xl font-bold tracking-tight text-slate-900">
              Ynuka Labs
            </h1>
            <p className="text-center text-xs text-slate-500 font-medium">Panel d&apos;administration</p>
          </div>
        </div>
      </div>
      <div className="mt-6 h-px w-12 bg-gradient-to-r from-[#2a5298]/30 to-[#2a5298]/30" />
    </header>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { oauthError } = Route.useLoaderData();
  const oauthHandled = useRef(false);

  // React UI Form Reactive States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /** Secours si le hash n'est pas encore visible dans le loader (certaines navigations SPA) */
  useLayoutEffect(() => {
    if (oauthHandled.current) return;
    const hash = window.location.hash;
    if (!hash.includes("token=") && !hash.includes("error=")) return;

    oauthHandled.current = true;
    setLoading(true);
    void phpAuth.handleOAuthCallbackFromHash(hash).then((result) => {
      if (result.redirectTo) {
        toast.success("Connexion Google réussie !");
        navigate({ to: result.redirectTo });
        return;
      }
      if (result.oauthError) {
        toast.error(translateGoogleOAuthError(result.oauthError));
      }
      setLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (oauthError) {
      toast.error(translateGoogleOAuthError(oauthError));
    }
  }, [oauthError]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("token=") || hash.includes("error=")) return;

    phpAuth.getSession().then(({ session }) => {
      if (session) {
        navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await phpAuth.startGoogleSignIn();
    } catch (err: unknown) {
      toast.error(translateAuthError(err));
      setGoogleLoading(false);
    }
  };

  /**
   * Resets secondary dynamic error boundaries whenever authorization view toggles
   */
  useEffect(() => {
    if (mode === "signin") {
      setName("");
      setShowValidationMessage(false);
    }
  }, [mode]);

  /**
   * Process Form payload submissions to core operational API routes securely
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signin") {
        // Sign-In execution stream
        await phpAuth.signInWithPassword(email, password);
        toast.success("Connexion réussie avec succès !");
      } else {
        // Sign-Up registration criteria validations
        if (!name.trim() || !email.trim() || !password.trim()) {
          setShowValidationMessage(true);
          setLoading(false);
          return;
        }
        await phpAuth.signUp(email, password, name);
        toast.success("Votre compte Ynuka Labs a été créé !");
      }
      
      // Post authentication state transition logic
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      // Stream localized technical error translations down to actionable notifications
      toast.error(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] w-full overflow-x-hidden font-sans selection:bg-[#2a5298]/20",
        "max-md:bg-gradient-to-b max-md:from-white max-md:via-slate-50/40 max-md:to-white max-md:overflow-y-auto",
        "md:items-center md:justify-center md:overflow-y-auto md:bg-gradient-to-br md:from-slate-100 md:via-[#eef4f3] md:to-slate-200 md:px-6 md:py-8 lg:px-8",
      )}
    >
      <div className="pointer-events-none absolute bottom-8 left-8 hidden h-48 w-48 rounded-full bg-amber-300/30 blur-3xl lg:block" />
      <div className="pointer-events-none absolute right-8 top-8 hidden h-40 w-40 rounded-full bg-blue-400/25 blur-3xl lg:block" />

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full flex-col bg-white",
          "max-md:min-h-[100dvh] max-md:max-w-none",
          "md:max-h-[min(640px,88dvh)] md:min-h-[580px] md:max-w-[920px] md:flex-row md:overflow-hidden",
          "md:rounded-3xl md:shadow-[0_24px_64px_-16px_rgba(30,60,114,0.18)] md:ring-1 md:ring-slate-900/5",
        )}
      >
        {/* Panneau gauche — desktop */}
        <aside
          className={cn(
            "relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1e3c72] via-[#2a5298] to-[#1e3c72] p-10 text-white md:flex md:w-[42%] lg:p-12",
            !isSignup && "md:order-last",
          )}
        >
          {/* Elegant geometric line overlay for abstract high-end texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Subtle custom background spotlight that leaks yellow/amber tint smoothly inside the blue panel */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#e6c229]/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

          {/* Top layout anchor padding placeholder */}
          <div className="h-2" />

          {/* CENTER DISPLAY LOGIC: Application Identity Hierarchy */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
            {/* BRAND NAME TITLE: Elevated directly above logo container */}
            <h2 className="text-2xl font-extrabold tracking-widest uppercase text-white drop-shadow-sm">
              Ynuka Labs
            </h2>
            <div className="w-8 h-[2px] bg-[#e6c229] rounded-full mt-2 mb-6 opacity-90" />
            
            {/* LOGO WRAPPER CONTAINER */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-md transition-all duration-300 group-hover:scale-110" />
              <img 
                src={logo} 
                alt="Ynuka Labs Platform Identity Logo" 
                className="relative h-20 w-20 rounded-2xl object-cover shadow-xl border-2 border-white/20 transition-transform duration-500 ease-out transform group-hover:rotate-3" 
              />
            </div>

            {/* DYNAMIC WELCOME TYPOGRAPHY */}
            <h3 className="mb-4 text-3xl font-bold tracking-tight text-white">
              {isSignup ? "Bienvenue !" : "Bon retour !"}
            </h3>

            <p className="max-w-[260px] text-sm leading-relaxed text-blue-100/90">
              {isSignup
                ? "Créez votre compte pour rejoindre le panel Ynuka Labs."
                : "Connectez-vous pour accéder à votre espace d'administration."}
            </p>
          </div>

          {/* Connexion / Inscription — emplacement fixe en bas du panneau */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-6">
            <p className="mb-3 text-center text-xs font-medium text-blue-100/70">
              Choisir un mode
            </p>
            <AuthModeToggle mode={mode} onChange={setMode} variant="panel" />
          </div>
        </aside>

        {/* Formulaire */}
        <section className="flex min-h-0 w-full flex-1 flex-col bg-white max-md:bg-transparent md:w-[58%] md:overflow-y-auto">
          <div
            className={cn(
              "flex flex-1 flex-col md:items-center md:justify-center md:min-h-full md:px-12 md:py-10",
              "max-md:items-center max-md:justify-center max-md:px-6 max-md:pt-[max(2rem,env(safe-area-inset-top))] max-md:pb-[max(3.5rem,env(safe-area-inset-bottom))]",
            )}
          >
            <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col md:max-w-[380px] md:flex-none md:space-y-0 max-md:rounded-3xl max-md:bg-white max-md:p-6 max-md:shadow-sm">
              <MobileBrandHeader />

              <div className="mb-6 w-full md:hidden">
                <AuthModeToggle mode={mode} onChange={setMode} variant="form" />
              </div>

              <div className="mb-7 text-center md:mb-8">
                <h2 className="text-lg font-semibold tracking-tight text-slate-800 md:text-3xl md:font-bold">
                  {isSignup ? "Créer un compte" : "Connexion"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {isSignup
                    ? "Remplissez le formulaire pour accéder au panel."
                    : "Entrez vos identifiants pour continuer."}
                </p>
              </div>

            <div className="mb-7 flex items-center justify-center gap-6 md:mb-6 md:gap-4">
              <SocialCircleButton
                label="Connexion avec Google"
                disabled={loading || googleLoading}
                onClick={handleGoogleSignIn}
              >
                <GoogleIcon className="h-4 w-4 text-slate-600 transition-colors" />
              </SocialCircleButton>
              <SocialCircleButton label="Connexion avec LinkedIn" onClick={() => toast.info("Connexion LinkedIn : non configurée pour le moment.")}>
                <LinkedInIcon className="h-4 w-4 text-slate-600 transition-colors" />
              </SocialCircleButton>
            </div>

            <p className="mb-6 text-center text-xs text-slate-400 md:mb-5">
              {isSignup ? "ou inscrivez-vous avec votre e-mail" : "ou connectez-vous avec votre e-mail"}
            </p>

            <form onSubmit={submit} className="w-full space-y-5 text-left md:space-y-5">
              
              {/* Optional Field Render Condition - Sign-Up Specific Inputs */}
              {isSignup && (
                <AuthField
                  id="name"
                  icon={User}
                  label="Nom complet"
                  placeholder="Ex. Martin Musagara"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  invalid={showValidationMessage && !name.trim()}
                  required
                />
              )}

              <AuthField
                id="email"
                icon={Mail}
                type="email"
                label="Adresse e-mail"
                placeholder="exemple@ynukalabs.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={showValidationMessage && !email.trim()}
                required
              />

              <AuthField
                id="password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                label="Mot de passe"
                placeholder="Au moins 6 caractères"
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={showValidationMessage && password.length < 6}
                required
                minLength={6}
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-200/50 hover:text-slate-700"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {/* Secondary Layout Helper Options - Placed right above the button */}
              {!isSignup && (
                <div className="flex flex-col gap-3 pt-1 text-xs max-md:px-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#2a5298] focus:ring-[#2a5298]/40"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        "Contactez l'administrateur pour réinitialiser votre mot de passe.",
                      )
                    }
                    className="text-left font-semibold text-[#2a5298] hover:underline sm:text-right"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Form Validation Feedback Layout Banners */}
              {isSignup && showValidationMessage && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-center text-xs text-rose-600 font-medium animate-shake">
                  Veuillez remplir tous les champs obligatoires correctement.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-8 w-full min-h-[54px] rounded-2xl bg-[#2a5298] py-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(42,82,152,0.32)]",
                  "transition-all duration-300 hover:bg-[#1e3c72] max-md:mt-7 max-md:rounded-2xl max-md:py-3.5 max-md:text-base md:mt-2 md:min-h-[50px] md:rounded-xl md:py-3.5 md:text-sm md:shadow-md",
                  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {loading ? "Patientez…" : isSignup ? "Créer mon compte" : "Se connecter"}
              </button>
            </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Isolated Functional SocialCircleButton component to encapsulate hover logic and accessibility attributes
 */
function SocialCircleButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm touch-manipulation sm:h-10 sm:w-10",
        "transition-all duration-200 hover:border-[#2a5298]/40 hover:bg-slate-50/50 hover:text-[#2a5298] hover:scale-105",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Clean SVG component assets tailored for structural responsive presentation layout inline
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export { LoginPage };