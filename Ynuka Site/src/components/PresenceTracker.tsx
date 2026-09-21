import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { authService } from "@/lib/auth";
import { API_ROOT } from "@/lib/api";

const SESSION_KEY = "ynuka_presence_sid";
const INTERVAL_MS = 25_000;

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

async function ping(path: string) {
  const user = authService.getUser();
  const payload = {
    sessionId: getSessionId(),
    path,
    pageTitle: typeof document !== "undefined" ? document.title : null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    language: typeof navigator !== "undefined" ? navigator.language : null,
    userEmail: user?.email || null,
    userName: user?.name || null,
  };

  try {
    await fetch(`${API_ROOT}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* silencieux : ne pas perturber la navigation */
  }
}

/** Envoie un heartbeat de présence vers l’admin (visiteurs actifs). */
export default function PresenceTracker() {
  const location = useLocation();
  const pathRef = useRef(location.pathname + location.search + location.hash);

  useEffect(() => {
    pathRef.current = location.pathname + location.search + location.hash;
    void ping(pathRef.current);

    const interval = window.setInterval(() => {
      void ping(pathRef.current);
    }, INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void ping(pathRef.current);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}
