import { cn } from "@/lib/utils";

type FormSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {title && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
}
