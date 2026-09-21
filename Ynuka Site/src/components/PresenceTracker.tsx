import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { authService } from "@/lib/auth";
import { API_ROOT } from "@/lib/api";

const SESSION_KEY = "ynuka_presence_sid";
const INTERVAL_MS = 20_000;

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

async function ping(path: string, pageView: boolean) {
  const user = authService.getUser();
  const payload = {
    sessionId: getSessionId(),
    path,
    pageView,
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
      mode: "cors",
    });
  } catch {
    /* silencieux */
  }
}

/** Suit toutes les visites (anonymes ou connectées) pour l’admin. */
export default function PresenceTracker() {
  const location = useLocation();
  const pathRef = useRef(location.pathname + location.search + location.hash);
  const booted = useRef(false);

  useEffect(() => {
    const next = location.pathname + location.search + location.hash;
    const isNav = booted.current && next !== pathRef.current;
    pathRef.current = next;
    booted.current = true;
    void ping(next, true);

    const interval = window.setInterval(() => {
      void ping(pathRef.current, false);
    }, INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void ping(pathRef.current, isNav);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}
