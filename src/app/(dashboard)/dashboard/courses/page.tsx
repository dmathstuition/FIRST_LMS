import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getEnrolledCourses } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EnrolledCourseCard } from "@/components/dashboard/enrolled-course-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const user = await requireUser();
  const courses = await getEnrolledCourses(user.id);

  const active = courses.filter((c) => c.status === "active");
  const completed = courses.filter((c) => c.status === "completed");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Courses"
        description="Track your progress and jump back into learning."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="When you enroll in a course it'll appear here so you can pick up anytime."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              In Progress ({active.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <CourseGrid
              courses={active}
              emptyTitle="Nothing in progress"
              emptyDesc="Start a new course or resume a completed one to review."
            />
          </TabsContent>
          <TabsContent value="completed">
            <CourseGrid
              courses={completed}
              emptyTitle="No completed courses yet"
              emptyDesc="Finish a course to earn a certificate and see it here."
            />
          </TabsContent>
          <TabsContent value="all">
            <CourseGrid courses={courses} emptyTitle="" emptyDesc="" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function CourseGrid({
  courses,
  emptyTitle,
  emptyDesc,
}: {
  courses: Awaited<ReturnType<typeof getEnrolledCourses>>;
  emptyTitle: string;
  emptyDesc: string;
}) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDesc}
        actionLabel="Browse courses"
        actionHref="/courses"
      />
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <EnrolledCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
