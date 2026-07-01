import { useEffect, useRef, useState } from "react";
import { ChevronUp, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/hooks/useDarkMode";

type ThemeChoice = "light" | "dark" | "system";

const OPTIONS: { value: ThemeChoice; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

export function AppearanceThemeSelect() {
  const { setThemeMode, themeMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = OPTIONS.find((o) => o.value === themeMode) ?? OPTIONS[2];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const pick = (value: ThemeChoice) => {
    setThemeMode(value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="theme-select">
      <div
        className={cn(
          "theme-select-shell",
          open ? "theme-select-shell--open" : "theme-select-shell--closed",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn("theme-select-trigger", open && "theme-select-trigger--open")}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <ActiveIcon className="h-4 w-4 shrink-0 text-slate-700 dark:text-muted-foreground" strokeWidth={2} />
            <span className="truncate">{active.label}</span>
          </span>
          <ChevronUp
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
              !open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open ? (
          <div role="listbox" className="theme-select-list" aria-label="Choisir un thème">
            {OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = themeMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(value)}
                  className={cn("theme-select-option", selected && "theme-select-option--selected")}
                >
                  <Icon className="theme-select-option-icon" strokeWidth={2} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
