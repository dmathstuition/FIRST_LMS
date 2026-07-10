import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Rocket, Undo2, HelpCircle } from "lucide-react";

import { requireRole } from "@/lib/auth";
import {
  getInstructorCourseDetail,
} from "@/features/instructor/queries";
import { getCategories } from "@/features/courses/queries";
import { setCourseStatus } from "@/features/instructor/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseForm } from "@/features/instructor/components/course-form";
import { CurriculumEditor } from "@/features/instructor/components/curriculum-editor";

export const metadata: Metadata = { title: "Course Builder" };

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["instructor", "admin"], "/instructor");

  const [detail, categories] = await Promise.all([
    getInstructorCourseDetail(id),
    getCategories(),
  ]);
  if (!detail) notFound();

  const { course, sections } = detail;
  const published = course.status === "published";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/instructor/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      <PageHeader title={course.title}>
        <Badge
          variant={published ? "success" : "secondary"}
          className="capitalize"
        >
          {course.status}
        </Badge>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/courses/${course.slug}`}>
            <ExternalLink className="size-4" /> Preview
          </Link>
        </Button>
        {/* Publish / unpublish toggle */}
        <form action={setCourseStatus.bind(null, course.id, !published)}>
          <Button
            type="submit"
            variant={published ? "outline" : "gradient"}
            size="sm"
          >
            {published ? (
              <>
                <Undo2 className="size-4" /> Unpublish
              </>
            ) : (
              <>
                <Rocket className="size-4" /> Publish
              </>
            )}
          </Button>
        </form>
      </PageHeader>

      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          <CurriculumEditor courseId={course.id} sections={sections} />
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <CourseForm
                categories={categories}
                courseId={course.id}
                defaults={{
                  title: course.title,
                  subtitle: course.subtitle ?? "",
                  categoryId: course.category?.id,
                  level: course.level,
                  price: course.price,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HelpCircle className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Build a quiz for this course</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create multiple-choice, true/false, and more with the quiz builder.
                </p>
              </div>
              <Button asChild variant="gradient">
                <Link href={`/instructor/courses/${course.id}/quiz`}>
                  Open quiz builder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
