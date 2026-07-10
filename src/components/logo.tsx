import { cn } from "@/lib/utils";

/**
 * D-MATHS brand mark — a ring crossed by a diagonal "pen" stroke.
 *
 * The ring uses `currentColor` (so the surrounding element's text color sets it
 * — blue on light surfaces, white inside a colored brand tile) and the diagonal
 * stroke uses the brand accent (orange). This mirrors the D-MATHS logo and works
 * on any background.
 */
export function Logo({
  className,
  strokeWidth = 5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="D-MATHS"
      className={cn("size-6", className)}
    >
      {/* Ring */}
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Diagonal accent stroke (the "pen") */}
      <path
        d="M13 34 L35 14"
        stroke="hsl(var(--accent))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
