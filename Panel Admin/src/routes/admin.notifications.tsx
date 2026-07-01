import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { phpApi } from "@/lib/php-api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationsPage,
});

type ContactMessage = {
  id: string;
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at?: string;
};

function NotificationsPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await phpApi.list("contact_messages", { limit: 20 });
        setItems((res.rows ?? []) as ContactMessage[]);
      } catch (e: any) {
        toast.error(e.message || "Impossible de charger les notifications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Messages récents et activité du site"
      />

      <ContentCard className="divide-y divide-slate-100 dark:divide-border/60">
        {loading && (
          <p className="px-6 py-10 text-center text-sm text-slate-400">Chargement…</p>
        )}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Bell className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Aucune notification</p>
          </div>
        )}
        {!loading &&
          items.map((item) => (
            <article key={item.id} className="flex gap-4 px-6 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-primary/15 dark:text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {item.subject || "Nouveau message"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.name || "Visiteur"}
                  {item.email ? ` · ${item.email}` : ""}
                </p>
                {item.message ? (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-muted-foreground">
                    {item.message}
                  </p>
                ) : null}
                {item.created_at ? (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleString("fr-FR")}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
      </ContentCard>
    </PageShell>
  );
}
