import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authService, type AuthUser } from "@/lib/auth";
import {
  fetchEventConversation,
  fetchSiteNotifications,
  markNotificationRead,
  sendEventConversationMessage,
  type EventConversationMessage,
  type SiteNotification,
} from "@/lib/api";
import GoogleSignInDialog from "@/components/auth/GoogleSignInDialog";

type EventExchangeSpaceProps = {
  eventId: string;
  eventTitle: string;
  registrationId: string;
};

export default function EventExchangeSpace({
  eventId,
  eventTitle,
  registrationId,
}: EventExchangeSpaceProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [showAuth, setShowAuth] = useState(!authService.isAuthenticated());
  const [messages, setMessages] = useState<EventConversationMessage[]>([]);
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [status, setStatus] = useState<string>("registered");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const [conv, notifs] = await Promise.all([
        fetchEventConversation(registrationId, email),
        fetchSiteNotifications(email),
      ]);
      setMessages(conv.messages || []);
      setStatus(conv.registration?.status || "registered");
      setNotifications(notifs);
    } catch (err) {
      toast({
        title: "Impossible de charger l'espace d'échange",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [registrationId, toast]);

  useEffect(() => {
    if (!user?.email) return;
    void load(user.email);
    const interval = window.setInterval(() => void load(user.email), 20000);
    return () => window.clearInterval(interval);
  }, [user?.email, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendEventConversationMessage(registrationId, {
        body: draft.trim(),
        email: user.email,
        name: user.name,
        senderType: "user",
      });
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch {
      toast({ title: "Envoi impossible", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const openNotif = async (n: SiteNotification) => {
    if (!user?.email) return;
    try {
      if (!n.read) {
        await markNotificationRead(user.email, n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      }
    } catch {
      /* ignore */
    }
    if (n.link) {
      try {
        const path = n.link.startsWith("/") ? n.link : new URL(n.link).pathname + new URL(n.link).search;
        if (path.includes("/espace") || path.includes("/events/")) {
          window.location.assign(path.startsWith("http") ? n.link : path);
        }
      } catch {
        /* stay on page */
      }
    }
  };

  const statusLabel =
    status === "selected"
      ? "Sélectionné(e)"
      : status === "rejected"
        ? "Non retenu(e)"
        : status === "waitlisted"
          ? "Liste d'attente"
          : "Inscription reçue";

  return (
    <div className="min-h-[70vh] bg-[#f7f8fa] dark:bg-[#0a1628]">
      <GoogleSignInDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuth(false);
        }}
        title="Accédez à votre espace"
        description="Connectez-vous avec Google pour échanger avec l'équipe Ynuka Labs au sujet de cet événement."
      />

      <header className="border-b border-[#0f2847]/15 bg-[#0f2847] text-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <Link
            to={`/events/${eventId}`}
            className="mb-3 inline-flex items-center gap-1 text-sm text-white/70 hover:text-[#ffb800]"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'événement
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffb800]">Espace d'échange</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{eventTitle}</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-[#ffb800]" />
            {statusLabel}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section className="flex min-h-[28rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#0c1a2e]">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2 className="font-semibold text-[#0f2847] dark:text-white">Discussion avec l'équipe</h2>
            <p className="text-xs text-slate-500">Posez vos questions — nous vous répondons ici.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
              </div>
            ) : messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">Aucun message pour le moment.</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderType === "user";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? "bg-[#0f2847] text-white"
                          : m.senderType === "system"
                            ? "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            : "bg-[#ffb800]/15 text-[#0f2847] dark:text-white"
                      }`}
                    >
                      {!mine ? (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                          {m.senderName || (m.senderType === "system" ? "Système" : "Équipe")}
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>
                        {new Date(m.createdAt).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {user ? (
            <form onSubmit={handleSend} className="border-t border-slate-200 p-3 dark:border-slate-700">
              <div className="flex gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Écrire un message à l'équipe…"
                  rows={2}
                  className="min-h-[2.75rem] resize-none"
                />
                <Button type="submit" variant="glow" disabled={sending || !draft.trim()} className="shrink-0 self-end">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          ) : (
            <div className="border-t border-slate-200 p-4 text-center dark:border-slate-700">
              <Button variant="glow" onClick={() => setShowAuth(true)}>
                Se connecter pour écrire
              </Button>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#0c1a2e]">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#ffb800]" />
            <h3 className="font-semibold text-[#0f2847] dark:text-white">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune notification pour l'instant.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void openNotif(n)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      n.read
                        ? "border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
                        : "border-[#ffb800]/40 bg-[#ffb800]/10 text-[#0f2847] dark:text-white"
                    }`}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs opacity-80">{n.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
