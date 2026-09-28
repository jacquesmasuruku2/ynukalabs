import { useEffect, useId, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService, type AuthUser } from "@/lib/auth";

type GoogleSignInDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  title: string;
  description: string;
  buttonId?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function decodeGoogleCredential(credential: string): AuthUser | null {
  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const data = JSON.parse(jsonPayload);
    if (!data.email) return null;
    return {
      email: String(data.email),
      name: String(data.name || data.email),
      avatar: data.picture ? String(data.picture) : undefined,
    };
  } catch {
    return null;
  }
}

export default function GoogleSignInDialog({
  open,
  onClose,
  onSuccess,
  title,
  description,
  buttonId,
}: GoogleSignInDialogProps) {
  const autoId = useId().replace(/:/g, "");
  const mountId = buttonId || `google-signin-${autoId}`;
  const rendered = useRef(false);

  useEffect(() => {
    if (!open) {
      rendered.current = false;
      return;
    }

    const render = () => {
      const el = document.getElementById(mountId);
      if (!el || !window.google?.accounts?.id) return false;
      el.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: { credential: string }) => {
          const user = decodeGoogleCredential(response.credential);
          if (!user) return;
          authService.signIn(user);
          onSuccess(user);
        },
      });
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 320,
      });
      rendered.current = true;
      return true;
    };

    if (render()) return;
    const timer = window.setInterval(() => {
      if (render()) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [open, mountId, onSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-[#0f2847]/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
      >
        <div className="relative bg-[#0f2847] px-6 pb-10 pt-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb800]">Ynuka Labs</p>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{description}</p>
        </div>

        <div className="relative -mt-5 px-6 pb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-center text-sm text-slate-600">
              Connexion sécurisée avec votre compte Google
            </p>
            <div className="flex justify-center">
              <div id={mountId} className="min-h-[44px]" />
            </div>
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <p className="mt-3 text-center text-xs text-amber-700">
                Configurez VITE_GOOGLE_CLIENT_ID pour activer Google Sign-In.
              </p>
            ) : null}
            <Button type="button" variant="ghost" className="mt-4 w-full" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
