import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api, RESOURCES, RESOURCE_LABELS, type Resource } from "@/lib/api";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries: [Resource, number | null][] = await Promise.all(
        RESOURCES.map(async (r): Promise<[Resource, number | null]> => {
          try {
            const res = await api.list(r, 1, 1);
            return [r, res.total];
          } catch {
            return [r, null];
          }
        }),
      );
      if (!cancelled) setCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground">Aperçu de votre base ynukalab_database_website</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {RESOURCES.map((r) => (
          <Link key={r} to={`/admin/${r}`}>
            <Card className="p-5 hover:shadow-md hover:border-primary/40 transition-all">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {RESOURCE_LABELS[r]}
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {counts[r] === null ? "—" : counts[r] ?? "…"}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
