import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getInstructorCourseDetail } from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { QuizBuilder } from "@/features/instructor/components/quiz-builder";

export const metadata: Metadata = { title: "Quiz Builder · Admin" };

export default async function AdminQuizBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"], "/admin");
  const detail = await getInstructorCourseDetail(id);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/courses/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>
      <PageHeader
        title="Quiz builder"
        description={`Create a quiz for “${detail.course.title}”.`}
      />
      <QuizBuilder courseId={id} />
    </div>
  );
}
