"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { setCourseFeatured } from "../actions";

/** Toggles a course's "featured" flag from the admin courses table. */
export function FeatureToggle({
  courseId,
  featured,
}: {
  courseId: string;
  featured: boolean;
}) {
  const [on, setOn] = React.useState(featured);
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      await setCourseFeatured(courseId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? "Unfeature course" : "Feature course"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        on
          ? "border-amber-400/40 bg-amber-400/10 text-amber-500"
          : "text-muted-foreground hover:border-amber-400/40 hover:text-amber-500",
        pending && "opacity-60",
      )}
    >
      <Star className={cn("size-3.5", on && "fill-current")} />
      {on ? "Featured" : "Feature"}
    </button>
  );
}
