import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getFeaturedCourses } from "@/features/courses/queries";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";

/**
 * Featured courses strip. Server component — fetches featured courses (live
 * from Supabase or demo fallback) and renders reusable CourseCards.
 */
export async function FeaturedCourses() {
  const courses = await getFeaturedCourses(4);

  return (
    <section id="courses" className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Featured"
          title="Courses learners love"
          subtitle="Hand-picked, top-rated courses to jump-start your journey."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={i * 0.06}>
              <CourseCard course={course} className="h-full" />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/courses">
              Browse all courses <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
