import { cn, formatCompact } from "@/lib/utils";
import type { SeriesPoint } from "@/features/instructor/types";

/**
 * Minimal, dependency-free bar chart (pure CSS/flex). Server-renderable.
 * Bars use the brand gradient; the tallest bar defines the scale. Values are
 * announced via title attributes for pointer users and read from the caption
 * for assistive tech.
 */
export function BarChart({
  data,
  valuePrefix = "",
  className,
  emptyLabel = "No data yet",
}: {
  data: SeriesPoint[];
  valuePrefix?: string;
  className?: string;
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className={cn("w-full", className)}>
      {/* Bars track — fixed height so percentage bar heights resolve. */}
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const heightPct = Math.max(4, (point.value / max) * 100);
          return (
            <div
              key={point.label}
              className="h-full flex-1"
              title={`${point.label}: ${valuePrefix}${point.value.toLocaleString()}`}
            >
              <div className="flex h-full items-end">
                <div
                  className="w-full rounded-t-md bg-brand-gradient transition-all"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Labels row — aligned to the bars via matching flex-1 columns. */}
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((point) => (
          <span
            key={point.label}
            className="flex-1 text-center text-xs text-muted-foreground"
          >
            {point.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        Bar chart:{" "}
        {data
          .map((d) => `${d.label} ${valuePrefix}${formatCompact(d.value)}`)
          .join(", ")}
        .
      </figcaption>
    </figure>
  );
}
