import { useEffect, useCallback } from "react";
import { phpAuth } from "@/lib/php-auth";
import { toast } from "sonner";

const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 heure en millisecondes
const ACTIVITY_KEY = "php_auth_last_activity";
const CHECK_INTERVAL_MS = 60 * 1000; // Vérifier toutes les minutes

/**
 * Hook pour gérer l'expiration de session après inactivité
 * Déconnecte l'utilisateur automatiquement après 1 heure d'inactivité
 */
export function useSessionTimeout() {
  const updateActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
  }, []);

  const checkSession = useCallback(() => {
    if (typeof window === "undefined") return;

    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    if (!lastActivity) {
      updateActivity();
      return;
    }

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      // Session expirée - déconnecter l'utilisateur
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      phpAuth.signOut();
      localStorage.removeItem(ACTIVITY_KEY);
      window.location.href = "/login";
    }
  }, [updateActivity]);

  useEffect(() => {
    // Initialiser le timestamp d'activité
    updateActivity();

    // Événements d'activité utilisateur
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Vérifier régulièrement l'expiration
    const interval = setInterval(checkSession, CHECK_INTERVAL_MS);

    // Nettoyage
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [updateActivity, checkSession]);

  // Vérifier au focus de la fenêtre (quand l'utilisateur revient sur l'onglet)
  useEffect(() => {
    const handleFocus = () => {
      checkSession();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkSession]);

  // Vérifier au visibility change (quand l'utilisateur revient sur l'onglet)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkSession]);
}
