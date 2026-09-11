import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CourseReview } from "../queries";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            value >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

/** Renders the list of course reviews, or nothing when empty. */
export function ReviewList({ reviews }: { reviews: CourseReview[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first enrolled student to share your experience.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              {review.author?.avatarUrl && (
                <AvatarImage src={review.author.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(review.author?.fullName ?? "Learner")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {review.author?.fullName ?? "Learner"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="ml-auto">
              <Stars value={review.rating} />
            </div>
          </div>
          {review.title && (
            <p className="mt-3 font-semibold">{review.title}</p>
          )}
          {review.content && (
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {review.content}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
