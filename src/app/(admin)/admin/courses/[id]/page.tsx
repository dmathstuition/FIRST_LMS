import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { getInstructorCourseDetail } from "@/features/instructor/queries";
import { getCategories } from "@/features/courses/queries";
import { CourseBuilderPanel } from "@/features/instructor/components/course-builder-panel";

export const metadata: Metadata = { title: "Course Builder · Admin" };

export default async function AdminCourseBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"], "/admin");

  const [detail, categories] = await Promise.all([
    getInstructorCourseDetail(id),
    getCategories(),
  ]);
  if (!detail) notFound();

  return (
    <CourseBuilderPanel detail={detail} categories={categories} basePath="/admin" />
  );
}
