import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  loading?: boolean;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
  loading,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "stat-card group relative flex flex-col rounded-xl bg-white border border-slate-100 p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        onClick && "cursor-pointer hover:border-slate-300",
      )}
      onClick={onClick}
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 leading-tight break-words pl-1">
            {label}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-2 transition-transform group-hover:scale-105 flex-shrink-0",
            iconBg,
            iconColor,
          )}
          aria-hidden
        >
          {Icon ? <Icon className="h-5 w-5" strokeWidth={2} aria-hidden /> : null}
        </div>
      </div>

      {/* Main value */}
      <div className="mt-3 flex flex-col gap-1.5 pl-1">
        <p
          className={cn(
            "text-3xl font-bold tabular-nums tracking-tight leading-tight h-10 flex items-center",
            valueColor ?? "text-slate-900 dark:text-white",
          )}
        >
          {loading ? (
            <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/80" />
          ) : (
            value
          )}
        </p>
        {hint && (
          <p className="text-xs text-slate-600 dark:text-slate-500 leading-tight h-5 flex items-center">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
