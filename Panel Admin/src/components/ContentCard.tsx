import { cn } from "@/lib/utils";

type ContentCardProps = {
  children: React.ReactNode;
  className?: string;
};

/** Panneau blanc principal des pages admin (tableaux, graphiques). */
export function ContentCard({ children, className }: ContentCardProps) {
  return <div className={cn("content-card", className)}>{children}</div>;
}

type ContentCardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function ContentCardFooter({ children, className }: ContentCardFooterProps) {
  return (
    <div className={cn("content-card-footer", className)}>
      {children}
    </div>
  );
}
