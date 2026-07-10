import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Users, Star, Pencil, BookOpen } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getInstructorCourses } from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatCompact } from "@/lib/utils";

export const metadata: Metadata = { title: "My Courses · Instructor" };

export default async function InstructorCoursesPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Courses"
        description="Create, edit, and manage your courses."
      >
        <Button asChild variant="gradient">
          <Link href="/instructor/courses/new">
            <Plus className="size-4" /> New course
          </Link>
        </Button>
      </PageHeader>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course, add lessons, and start teaching."
          actionLabel="Create a course"
          actionHref="/instructor/courses/new"
        />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-32">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="animated-gradient absolute inset-0" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{course.title}</h3>
                    <Badge
                      variant={
                        course.status === "published" ? "success" : "secondary"
                      }
                      className="capitalize"
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {formatCompact(course.studentCount)} students
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="size-3.5 fill-current" />
                      {course.ratingAvg.toFixed(1)}
                    </span>
                    <span>{course.lessonCount} lessons</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(course.revenue)} earned
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/instructor/courses/${course.id}`}>
                      <Pencil className="size-4" /> Manage
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/courses/${course.slug}`}>Preview</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
