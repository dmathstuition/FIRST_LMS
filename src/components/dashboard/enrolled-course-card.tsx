import Image from "next/image";
import Link from "next/link";
import { PlayCircle, CheckCircle2, Clock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { EnrolledCourse } from "@/types";

/**
 * Enrolled-course card with a progress bar and a resume/continue CTA.
 * Links into the course player (Phase 8) at the course's learn route.
 */
export function EnrolledCourseCard({
  course,
  className,
}: {
  course: EnrolledCourse;
  className?: string;
}) {
  const done = course.status === "completed";

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="animated-gradient absolute inset-0" />
        )}
        {done && (
          <Badge
            variant="success"
            className="absolute left-3 top-3 gap-1 shadow-sm"
          >
            <CheckCircle2 className="size-3.5" /> Completed
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {course.category && (
          <span className="text-xs font-medium text-primary">
            {course.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">
          {course.title}
        </h3>

        {course.lastLessonTitle && !done && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            Up next: {course.lastLessonTitle}
          </p>
        )}

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              {done ? "Finished" : `${Math.round(course.progressPct)}% complete`}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" />
              {formatDuration(course.durationMinutes)}
            </span>
          </div>
          <Progress value={course.progressPct} />
        </div>

        <Button asChild variant={done ? "outline" : "gradient"} className="mt-4">
          <Link href={`/learn/${course.slug}`}>
            <PlayCircle className="size-4" />
            {done ? "Review course" : "Continue learning"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
