import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getCategories } from "@/features/courses/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CourseForm } from "@/features/instructor/components/course-form";

export const metadata: Metadata = { title: "New Course" };

export default async function NewCoursePage() {
  await requireRole(["instructor", "admin"], "/instructor");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/instructor/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </Link>
      <PageHeader
        title="Create a new course"
        description="Start with the basics — you can add lessons and content next."
      />
      <Card>
        <CardContent className="pt-6">
          <CourseForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
