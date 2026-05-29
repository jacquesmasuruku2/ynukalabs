import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Period = 7 | 30 | 90;

type PeriodToggleProps = {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
};

export function PeriodToggle({ value, onChange, className }: PeriodToggleProps) {
  return (
    <div className={cn("period-toggle", className)} role="group" aria-label="Période">
      {([7, 30, 90] as Period[]).map((p) => (
        <Button
          key={p}
          type="button"
          size="sm"
          variant={value === p ? "default" : "ghost"}
          className={cn(
            "h-8 min-w-[2.75rem] rounded-lg px-3 text-sm font-medium shadow-none",
            value !== p &&
              "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground",
          )}
          onClick={() => onChange(p)}
        >
          {p} j
        </Button>
      ))}
    </div>
  );
}
