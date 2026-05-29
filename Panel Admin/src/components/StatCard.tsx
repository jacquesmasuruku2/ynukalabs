import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl bg-white p-4 sm:p-5 lg:p-6",
        "shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]",
        "transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]",
        "border border-slate-100/50",
        "dark:bg-card dark:border-border/40 dark:shadow-none",
      )}
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground leading-tight">
            {label}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full",
            "transition-transform group-hover:scale-105",
            iconBg,
          )}
          aria-hidden
        >
          {Icon ? <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} strokeWidth={2.25} aria-hidden /> : null}
        </div>
      </div>

      {/* Main value */}
      <div className="mt-3 sm:mt-4 lg:mt-5 flex flex-col gap-0.5 sm:gap-1">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-foreground leading-none">
          {loading ? (
            <span className="inline-block h-8 w-12 sm:h-10 sm:w-16 animate-pulse rounded bg-slate-200 dark:bg-muted" />
          ) : (
            value
          )}
        </p>
        {hint && (
          <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-slate-500 dark:text-muted-foreground leading-tight">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
