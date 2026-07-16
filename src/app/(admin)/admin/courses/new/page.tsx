import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getCategories } from "@/features/courses/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CourseForm } from "@/features/instructor/components/course-form";

export const metadata: Metadata = { title: "New Course · Admin" };

export default async function AdminNewCoursePage() {
  await requireRole(["admin"], "/admin");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </Link>
      <PageHeader
        title="Create a new course"
        description="Add the basics, then upload lessons and content on the next step."
      />
      <Card>
        <CardContent className="pt-6">
          <CourseForm categories={categories} basePath="/admin" />
        </CardContent>
      </Card>
    </div>
  );
}
