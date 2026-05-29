import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("form-field", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900 dark:text-foreground">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
