import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormToggleRowProps = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormToggleRow({ label, description, children, className }: FormToggleRowProps) {
  return (
    <div className={cn("form-toggle-row", className)}>
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
