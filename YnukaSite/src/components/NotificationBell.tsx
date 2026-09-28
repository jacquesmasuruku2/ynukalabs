import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { authService } from "@/lib/auth";
import {
  fetchSiteNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type SiteNotification,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const SEEN_KEY = "ynuka_notif_seen_ids";

function loadSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-100)));
}

function toAppPath(link: string | null | undefined): string | null {
  if (!link) return null;
  try {
    if (link.startsWith("/")) return link;
    const u = new URL(link);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return link;
  }
}

function showBrowserNotification(n: SiteNotification) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const note = new Notification(n.title, {
      body: n.body,
      icon: "/logo.PNG",
      tag: n.id,
    });
    note.onclick = () => {
      window.focus();
      const path = toAppPath(n.link);
      if (path) window.location.assign(path);
      note.close();
    };
  } catch {
    /* ignore */
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SiteNotification[]>([]);
  const [email, setEmail] = useState(() => authService.getUser()?.email ?? null);
  const rootRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string>>(loadSeenIds());

  const unread = items.filter((n) => !n.read).length;

  const refresh = useCallback(async () => {
    const user = authService.getUser();
    setEmail(user?.email ?? null);
    if (!user?.email) {
      setItems([]);
      return;
    }
    try {
      const rows = await fetchSiteNotifications(user.email);
      const list = Array.isArray(rows) ? rows : [];
      setItems(list);

      for (const n of list) {
        if (!n.read && !seenRef.current.has(n.id)) {
          seenRef.current.add(n.id);
          showBrowserNotification(n);
        }
      }
      saveSeenIds(seenRef.current);
    } catch {
      /* API indisponible : ne pas casser la navbar */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onStorage = () => void refresh();
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(() => void refresh(), 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const ensurePermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const onToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await ensurePermission();
      await refresh();
    }
  };

  const openItem = async (n: SiteNotification) => {
    if (!email) return;
    try {
      if (!n.read) {
        await markNotificationRead(email, n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      }
    } catch {
      /* ignore */
    }
    setOpen(false);
    const path = toAppPath(n.link);
    if (path) navigate(path);
  };

  const markAll = async () => {
    if (!email) return;
    try {
      await markAllNotificationsRead(email);
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch {
      /* ignore */
    }
  };

  if (!email) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => void onToggle()}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#0f2847] transition hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/10"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb800] px-1 text-[10px] font-bold text-[#0f2847]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[60] mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#0c1a2e]">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-700">
            <p className="text-sm font-semibold text-[#0f2847] dark:text-white">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAll()}
                className="text-xs font-medium text-[#315795] hover:text-[#ffb800] dark:text-slate-300"
              >
                Tout marquer lu
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">Aucune notification</li>
            ) : (
              items.slice(0, 20).map((n) => (
                <li key={n.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => void openItem(n)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60",
                      !n.read && "bg-[#ffb800]/10"
                    )}
                  >
                    <p className="text-sm font-medium text-[#0f2847] dark:text-white">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-700">
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[#315795] hover:text-[#ffb800] dark:text-slate-300"
            >
              Voir les événements →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
