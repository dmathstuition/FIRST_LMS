import Image from "next/image";
import Link from "next/link";
import { Star, Users, Clock, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  formatCurrency,
  formatCompact,
  formatDuration,
  getInitials,
} from "@/lib/utils";
import type { CourseCard as CourseCardType } from "@/types";

const levelLabels: Record<CourseCardType["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All Levels",
};

/**
 * Reusable course card for the catalog + featured strip. Server-rendered
 * (no client JS); hover motion is pure CSS for performance.
 */
export function CourseCard({
  course,
  className,
}: {
  course: CourseCardType;
  className?: string;
}) {
  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="animated-gradient absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <PlayCircle className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity group-hover:opacity-90" />
        <div className="absolute left-3 top-3 flex gap-2">
          {course.isBestseller && (
            <Badge variant="warning" className="shadow-sm">
              Bestseller
            </Badge>
          )}
          <Badge variant="secondary" className="shadow-sm backdrop-blur">
            {levelLabels[course.level]}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {course.category && (
          <span className="mb-1.5 text-xs font-medium text-primary">
            {course.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.subtitle}
          </p>
        )}

        {/* Instructor */}
        {course.instructor && (
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="size-6">
              {course.instructor.avatarUrl && (
                <AvatarImage src={course.instructor.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(course.instructor.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {course.instructor.fullName}
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-amber-500">
            <Star className="size-3.5 fill-current" />
            {course.ratingAvg.toFixed(1)}
            <span className="font-normal text-muted-foreground">
              ({formatCompact(course.ratingCount)})
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {formatCompact(course.studentCount)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatDuration(course.durationMinutes)}
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end gap-2 border-t pt-4">
          <span className="text-lg font-bold">
            {formatCurrency(
              hasDiscount ? course.discountPrice! : course.price,
              course.currency,
            )}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(course.price, course.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
