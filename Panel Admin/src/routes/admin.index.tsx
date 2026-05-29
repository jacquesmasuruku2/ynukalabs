import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ContentCard } from "@/components/ContentCard";
import { PeriodToggle } from "@/components/PeriodToggle";
import { phpApi } from "@/lib/php-api";
import { Users, HeartHandshake, ClipboardList, Mail, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const CHART_GRID = "#f1f5f9";
const CHART_AXIS = "#94a3b8";
const CHART_TOOLTIP_BG = "#ffffff";
const CHART_TOOLTIP_BORDER = "#e2e8f0";

const SOURCES = [
  {
    key: "users",
    label: "Utilisateurs",
    icon: Users,
    color: "#2563eb",
    iconBg: "bg-blue-50 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "donations",
    label: "Dons",
    icon: HeartHandshake,
    color: "#10b981",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "event_registrations",
    label: "Inscriptions",
    icon: ClipboardList,
    color: "#f59e0b",
    iconBg: "bg-amber-50 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "contact_messages",
    label: "Messages",
    icon: Mail,
    color: "#ef4444",
    iconBg: "bg-red-50 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    key: "newsletter_subscribers",
    label: "Newsletter",
    icon: Send,
    color: "#8b5cf6",
    iconBg: "bg-violet-50 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  iconColor: string;
}>;

function Dashboard() {
  const [period, setPeriod] = useState<Period>(30);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [series, setSeries] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
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

        const days: string[] = [];
        for (let i = period - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 3600 * 1000);
          days.push(d.toISOString().slice(0, 10));
        }
        const bucket: Record<string, Record<string, string | number>> = Object.fromEntries(
          days.map((d) => [d, { date: d.slice(5) }]),
        );

        await Promise.all(
          SOURCES.map(async (s) => {
            try {
              const res = await phpApi.list(s.key, { limit: 500 });
              (res.rows ?? []).forEach((row: { created_at?: string; timestamp?: string }) => {
                const createdAt = row.created_at || row.timestamp;
                if (createdAt) {
                  const day = String(createdAt).slice(0, 10);
                  if (bucket[day]) {
                    bucket[day][s.key] = (Number(bucket[day][s.key]) || 0) + 1;
                  }
                }
              });
            } catch {
              /* ignore */
            }
            days.forEach((d) => {
              if (bucket[d][s.key] === undefined) bucket[d][s.key] = 0;
            });
          }),
        );

        if (cancelled) return;
        setTotals(Object.fromEntries(totalEntries));
        setSeries(Object.values(bucket));
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        if (!cancelled) setLoading(false);
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
    <PageShell>
      <div className="space-y-8">
        <PageHeader
          title="Tableau de bord"
          description={`Statistiques des ${periodLabel} derniers`}
          actions={<PeriodToggle value={period} onChange={setPeriod} />}
        />

        {/* Statistics Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5">
          {SOURCES.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              icon={s.icon}
              iconBg={s.iconBg}
              iconColor={s.iconColor}
              loading={loading}
              value={totals[s.key] ?? 0}
              hint={`Nouveaux sur ${period} j`}
            />
          ))}
        </div>

        {/* Chart Section */}
        <ContentCard className="space-y-6 p-5 sm:p-6 lg:p-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Évolution par jour
            </h2>
            <p className="text-sm text-slate-500 dark:text-muted-foreground">
              Nombre de nouveaux enregistrements par jour, par catégorie
            </p>
          </div>
          <div className="h-[min(360px,50vh)] w-full min-h-[280px] -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  {SOURCES.map((s) => (
                    <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: CHART_AXIS }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: CHART_AXIS }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: CHART_TOOLTIP_BG,
                    border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 20 }} 
                  iconType="circle"
                  verticalAlign="top"
                  height={30}
                />
                {SOURCES.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    fill={`url(#g-${s.key})`}
                    strokeWidth={2.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>
      </div>
    </PageShell>
  );
}
