import type { Metadata } from "next";

import { getPublishedCourses, getCategories } from "@/features/courses/queries";
import { Catalog } from "@/features/courses/components/catalog";

export const metadata: Metadata = {
  title: "Browse Courses",
  description:
    "Explore expert-led courses in mathematics, web development, data science, design and more.",
  alternates: { canonical: "/courses" },
};

/** Public course catalog with search, filtering, and sorting. */
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
  ]);

  return (
    <div className="container py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore our courses
        </h1>
        <p className="mt-3 text-muted-foreground">
          {courses.length} premium courses to help you master real, in-demand
          skills.
        </p>
      </header>

      <div className="mt-10">
        <Catalog
          courses={courses}
          categories={categories}
          initialCategory={category}
        />
      </div>
    </div>
  );
}
