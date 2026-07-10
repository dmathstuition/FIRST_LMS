import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Compact KPI card used across the dashboard home. */
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
  accent?: "primary" | "accent" | "amber" | "emerald";
}) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
  } as const;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            accents[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
