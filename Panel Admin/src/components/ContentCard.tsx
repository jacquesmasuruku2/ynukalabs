import { cn } from "@/lib/utils";

type ContentCardProps = {
  children: React.ReactNode;
  className?: string;
};

/** Panneau blanc principal des pages admin (tableaux, graphiques) - Style SaaS Premium */
export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        "content-card rounded-xl bg-white border border-slate-100 shadow-sm p-6 text-slate-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ContentCardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function ContentCardFooter({ children, className }: ContentCardFooterProps) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5",
        "dark:border-slate-800/60",
        className
      )}
    >
      {children}
    </div>
  );
}
