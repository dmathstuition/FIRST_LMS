import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "primary" | "accent" | "amber" | "emerald" | "violet" | "sky";

/**
 * KPI card — a soft pastel icon tile beside a bold, colour-matched number.
 * Friendly and airy; used across the student, instructor, and admin dashboards.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
}) {
  const tile: Record<Accent, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    violet: "bg-violet-500/10 text-violet-500",
    sky: "bg-sky-500/10 text-sky-500",
  };
  const number: Record<Accent, string> = {
    primary: "text-primary",
    accent: "text-accent",
    amber: "text-amber-500",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    sky: "text-sky-600 dark:text-sky-400",
  };

  return (
    <Card className="animate-fade-in rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            tile[accent],
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              "text-2xl font-bold leading-tight tracking-tight",
              number[accent],
            )}
          >
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}
