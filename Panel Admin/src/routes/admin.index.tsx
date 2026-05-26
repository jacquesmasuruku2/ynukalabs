import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { phpApi } from "@/lib/php-api";
import { Users, HeartHandshake, ClipboardList, Mail, Send } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

type Period = 7 | 30 | 90;

const SOURCES = [
  { key: "users", label: "Utilisateurs", icon: Users, color: "var(--primary)" },
  { key: "donations", label: "Dons", icon: HeartHandshake, color: "#10b981" },
  { key: "event_registrations", label: "Inscriptions", icon: ClipboardList, color: "#f59e0b" },
  { key: "contact_messages", label: "Messages", icon: Mail, color: "#ef4444" },
  { key: "newsletter_subscribers", label: "Newsletter", icon: Send, color: "#8b5cf6" },
] as const;

function Dashboard() {
  const [period, setPeriod] = useState<Period>(30);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - period * 24 * 3600 * 1000);
        const sinceIso = since.toISOString();

        // Fetch totals from API for each resource
        const totalEntries = await Promise.all(
          SOURCES.map(async (s) => {
            try {
              const res = await phpApi.list(s.key, { limit: 1 });
              return [s.key, res.total ?? 0] as const;
            } catch {
              return [s.key, 0] as const;
            }
          }),
        );

        // Generate days and bucket for chart data
        const days: string[] = [];
        for (let i = period - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 3600 * 1000);
          days.push(d.toISOString().slice(0, 10));
        }
        const bucket: Record<string, any> = Object.fromEntries(
          days.map((d) => [d, { date: d.slice(5) }]),
        );

        // Fetch data from API and bucket by day
        await Promise.all(
          SOURCES.map(async (s) => {
            try {
              const res = await phpApi.list(s.key, { limit: 500 });
              (res.rows ?? []).forEach((row: any) => {
                const createdAt = row.created_at || row.timestamp;
                if (createdAt) {
                  const day = String(createdAt).slice(0, 10);
                  if (bucket[day]) bucket[day][s.key] = (bucket[day][s.key] ?? 0) + 1;
                }
              });
            } catch (e) {
              // Silently fail for this resource
            }
            // Ensure 0 baseline
            days.forEach((d) => {
              if (bucket[d][s.key] === undefined) bucket[d][s.key] = 0;
            });
          }),
        );

        if (cancelled) return;
        setTotals(Object.fromEntries(totalEntries));
        setSeries(Object.values(bucket));
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const periodLabel = useMemo(
    () => ({ 7: "7 jours", 30: "30 jours", 90: "90 jours" })[period],
    [period],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">
            Statistiques des {periodLabel} derniers
          </p>
        </div>
        <div className="flex gap-1 rounded-md border bg-card p-1">
          {([7, 30, 90] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "ghost"}
              onClick={() => setPeriod(p)}
            >
              {p} j
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SOURCES.map((s) => (
          <Card key={s.key} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {loading ? "…" : totals[s.key] ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Nouveaux sur {period} j
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-3">
          <h2 className="font-semibold">Évolution par jour</h2>
          <p className="text-xs text-muted-foreground">
            Nombre de nouveaux enregistrements par jour, par catégorie
          </p>
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {SOURCES.map((s) => (
                  <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {SOURCES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  fill={`url(#g-${s.key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
