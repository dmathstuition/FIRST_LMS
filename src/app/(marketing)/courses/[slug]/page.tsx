import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  BarChart,
  PlayCircle,
  CheckCircle2,
  Globe,
  Infinity as InfinityIcon,
  Award,
} from "lucide-react";

import { getCourseBySlug, getPublishedCourses } from "@/features/courses/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatCurrency,
  formatCompact,
  formatDuration,
  getInitials,
} from "@/lib/utils";

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All Levels",
} as const;

// Representative "what you'll learn" bullets shown on every course detail page.
const learningOutcomes = [
  "Build a rock-solid foundation from first principles",
  "Apply concepts through hands-on, real-world projects",
  "Gain intuition, not just memorized procedures",
  "Earn a verifiable certificate on completion",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.subtitle ?? undefined,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.subtitle ?? undefined,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const price = course.discountPrice ?? course.price;
  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div>
      {/* Hero header */}
      <div className="relative overflow-hidden border-b bg-brand-900 text-white">
        <div className="absolute inset-0 bg-brand-radial opacity-40" />
        <div className="container relative grid gap-8 py-12 lg:grid-cols-3 lg:py-16">
          <div className="lg:col-span-2">
            {course.category && (
              <Link
                href={`/courses?category=${course.category.slug}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {course.category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-3 max-w-2xl text-lg text-white/80">
                {course.subtitle}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1 font-medium text-amber-400">
                <Star className="size-4 fill-current" />
                {course.ratingAvg.toFixed(1)}
                <span className="font-normal text-white/70">
                  ({formatCompact(course.ratingCount)} ratings)
                </span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                <Users className="size-4" />
                {formatCompact(course.studentCount)} students
              </span>
              <span className="flex items-center gap-1 text-white/80">
                <BarChart className="size-4" />
                {levelLabels[course.level]}
              </span>
            </div>

            {course.instructor && (
              <div className="mt-5 flex items-center gap-3">
                <Avatar>
                  {course.instructor.avatarUrl && (
                    <AvatarImage src={course.instructor.avatarUrl} alt="" />
                  )}
                  <AvatarFallback>
                    {getInitials(course.instructor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="text-white/60">Created by</p>
                  <p className="font-medium">{course.instructor.fullName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container grid gap-10 py-12 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="text-xl font-semibold">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {learningOutcomes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Course content</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.lessonCount} lessons •{" "}
              {formatDuration(course.durationMinutes)} total
            </p>
            <div className="mt-4 divide-y overflow-hidden rounded-2xl border">
              {["Getting Started", "Core Concepts", "Advanced Topics", "Final Project"].map(
                (section, i) => (
                  <div key={section} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="size-5 text-primary" />
                      <span className="font-medium">
                        Section {i + 1}: {section}
                      </span>
                    </div>
                    {i === 0 && <Badge variant="accent">Preview available</Badge>}
                  </div>
                ),
              )}
            </div>
          </section>

          {course.instructor && (
            <section>
              <h2 className="text-xl font-semibold">Your instructor</h2>
              <div className="mt-4 flex items-start gap-4 rounded-2xl border bg-card p-5">
                <Avatar className="size-16">
                  {course.instructor.avatarUrl && (
                    <AvatarImage src={course.instructor.avatarUrl} alt="" />
                  )}
                  <AvatarFallback>
                    {getInitials(course.instructor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{course.instructor.fullName}</p>
                  {course.instructor.headline && (
                    <p className="text-sm text-muted-foreground">
                      {course.instructor.headline}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sticky purchase card */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="relative aspect-video bg-muted">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="animated-gradient absolute inset-0" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <PlayCircle className="size-14 text-white" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(price, course.currency)}
                  </span>
                  {hasDiscount && (
                    <span className="mb-1 text-muted-foreground line-through">
                      {formatCurrency(course.price, course.currency)}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <Button asChild size="lg" variant="gradient">
                    <Link href={`/register?next=/courses/${course.slug}`}>
                      Enroll now
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={`/courses/${course.slug}#preview`}>
                      <PlayCircle className="size-4" /> Watch preview
                    </Link>
                  </Button>
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  30-day money-back guarantee
                </p>

                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    {formatDuration(course.durationMinutes)} of content
                  </li>
                  <li className="flex items-center gap-2">
                    <InfinityIcon className="size-4 text-muted-foreground" />
                    Full lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    Access on any device
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    Certificate of completion
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Pre-render known course slugs at build time for speed + SEO. */
export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.map((c) => ({ slug: c.slug }));
}
