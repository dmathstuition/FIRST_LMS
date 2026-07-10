import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getCoursePlayerData } from "@/features/player/queries";
import { CoursePlayer } from "@/features/player/components/course-player";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Learn", alternates: { canonical: `/learn/${slug}` } };
}

/**
 * Netflix-style course player. Requires an authenticated user; lesson
 * visibility is further governed by RLS (preview / enrollment / ownership).
 */
export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/learn/${slug}`);
  const data = await getCoursePlayerData(slug, user.id);
  if (!data) notFound();

  return <CoursePlayer data={data} />;
}
