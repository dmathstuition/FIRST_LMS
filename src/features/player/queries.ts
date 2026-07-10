import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import type { LessonType } from "@/types";
import type { VideoSource } from "@/lib/video/provider";
import type { CoursePlayerData, PlayerSection } from "./types";
import { getDemoPlayerData } from "./demo-data";

/**
 * Load everything the course player needs: the curriculum (sections → lessons →
 * resources) plus the current user's completion state. Demo data when Supabase
 * isn't connected; otherwise live, RLS-scoped reads (lesson visibility is
 * governed by preview/ownership/enrollment policies).
 */
export async function getCoursePlayerData(
  slug: string,
  userId: string,
): Promise<CoursePlayerData | null> {
  if (!integrations.supabase) return getDemoPlayerData(slug);

  try {
    const supabase = await createClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("slug", slug)
      .single();
    if (error || !course) return null;

    const courseId = (course as { id: string }).id;

    const [{ data: sections }, { data: progress }] = await Promise.all([
      supabase
        .from("sections")
        .select(
          `id, title, sort_order,
           lessons (
             id, section_id, title, type, content, duration_minutes,
             is_preview, sort_order,
             lesson_resources ( id, title, file_url, kind )
           )`,
        )
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId)
        .eq("course_id", courseId),
    ]);

    const completedLessonIds = (
      (progress as { lesson_id: string; completed: boolean }[]) ?? []
    )
      .filter((p) => p.completed)
      .map((p) => p.lesson_id);

    const mapped: PlayerSection[] = ((sections as unknown as SectionRow[]) ?? [])
      .map((s) => ({
        id: s.id,
        title: s.title,
        lessons: [...(s.lessons ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => {
            const content = (l.content ?? {}) as Record<string, unknown>;
            const isVideo = ["video", "youtube", "vimeo"].includes(l.type);
            const video: VideoSource | null =
              isVideo && content.ref
                ? {
                    provider: (content.provider as VideoSource["provider"]) ?? "url",
                    ref: String(content.ref),
                  }
                : null;
            return {
              id: l.id,
              sectionId: l.section_id,
              title: l.title,
              type: l.type,
              video,
              body:
                (content.body as string) ?? (content.url as string) ?? null,
              transcript: (content.transcript as string) ?? null,
              durationMinutes: l.duration_minutes,
              isPreview: l.is_preview,
              resources: (l.lesson_resources ?? []).map((r) => ({
                id: r.id,
                title: r.title,
                url: r.file_url,
                kind: r.kind,
              })),
              completed: completedLessonIds.includes(l.id),
            };
          }),
      }));

    const all = mapped.flatMap((s) => s.lessons);
    if (all.length === 0) return getDemoPlayerData(slug);
    const firstIncomplete = all.find((l) => !l.completed) ?? all[0];

    return {
      course: course as { id: string; slug: string; title: string },
      sections: mapped,
      completedLessonIds,
      progressPct: Math.round((completedLessonIds.length / all.length) * 100),
      initialLessonId: firstIncomplete.id,
    };
  } catch {
    return getDemoPlayerData(slug);
  }
}

type SectionRow = {
  id: string;
  title: string;
  sort_order: number;
  lessons:
    | {
        id: string;
        section_id: string;
        title: string;
        type: LessonType;
        content: Record<string, unknown> | null;
        duration_minutes: number;
        is_preview: boolean;
        sort_order: number;
        lesson_resources:
          | { id: string; title: string; file_url: string; kind: string }[]
          | null;
      }[]
    | null;
};
