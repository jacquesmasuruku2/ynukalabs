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

const CHART_GRID = "#334155";
const CHART_AXIS = "#94a3b8";
const CHART_TOOLTIP_BG = "#020617";
const CHART_TOOLTIP_BORDER = "#334155";
const CHART_TOOLTIP_COLOR = "#e2e8f0";

const SOURCES = [
  {
    key: "users",
    label: "Utilisateurs",
    icon: Users,
    color: "#38bdf8",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
  },
  {
    key: "donations",
    label: "Dons",
    icon: HeartHandshake,
    color: "#c084fc",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-400",
  },
  {
    key: "event_registrations",
    label: "Inscriptions",
    icon: ClipboardList,
    color: "#34d399",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    key: "contact_messages",
    label: "Messages",
    icon: Mail,
    color: "#818cf8",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    key: "newsletter_subscribers",
    label: "Newsletter",
    icon: Send,
    color: "#fbbf24",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {SOURCES.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              icon={s.icon}
              iconBg={s.iconBg}
              iconColor={s.iconColor}
              valueColor={s.iconColor}
              loading={loading}
              value={totals[s.key] ?? 0}
              hint={`Nouveaux sur ${period} j`}
            />
          ))}
        </div>

        {/* Chart Section */}
        <ContentCard className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
              Évolution par jour
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
              Nombre de nouveaux enregistrements par jour, par catégorie
            </p>
          </div>
          <div className="h-[min(420px,55vh)] w-full min-h-[320px] overflow-hidden rounded-xl border border-slate-100 !dark:border-slate-800/60 bg-white !dark:bg-slate-900 p-4">
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
                    color: CHART_TOOLTIP_COLOR,
                  }}
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
          
          {/* Legend */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ContentCard>
      </div>
    </PageShell>
  );
}
