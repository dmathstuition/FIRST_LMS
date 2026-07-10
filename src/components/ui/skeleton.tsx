import { cn } from "@/lib/utils";

/** Skeleton loader block with shimmer (see `.skeleton` in globals.css). */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("skeleton rounded-md", className)} {...props} />
  );
}

export { Skeleton };
