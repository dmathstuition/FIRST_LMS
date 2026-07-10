import type { Metadata } from "next";
import { Star, MessageSquare } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getInstructorReviews } from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews · Instructor" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-4 fill-amber-400 text-amber-400"
              : "size-4 text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const reviews = await getInstructorReviews(user.id);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Reviews"
        description={
          reviews.length > 0
            ? `${avg.toFixed(1)} average across ${reviews.length} reviews`
            : "What your students are saying."
        }
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="As students complete your courses, their reviews will show up here."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar>
                  {r.studentAvatar && (
                    <AvatarImage src={r.studentAvatar} alt="" />
                  )}
                  <AvatarFallback>{getInitials(r.studentName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">{r.studentName}</span>
                    <Stars rating={r.rating} />
                    {r.replied && <Badge variant="secondary">Replied</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.courseTitle} ·{" "}
                    {new Date(r.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {r.content && (
                    <p className="mt-2 text-sm text-foreground/90">
                      {r.content}
                    </p>
                  )}
                  {!r.replied && (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <MessageSquare className="size-3.5" /> Reply
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
