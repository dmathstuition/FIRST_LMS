import type { LessonType } from "@/types";
import type { VideoSource } from "@/lib/video/provider";

export interface LessonResource {
  id: string;
  title: string;
  url: string;
  kind: string;
}

/** A lesson as consumed by the course player. */
export interface PlayerLesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  /** Video source for video lessons (provider + ref). */
  video: VideoSource | null;
  /** Body text for text/markdown lessons, or a URL for pdf/embed lessons. */
  body: string | null;
  /** Optional transcript text shown in the Transcript tab. */
  transcript: string | null;
  durationMinutes: number;
  isPreview: boolean;
  resources: LessonResource[];
  completed: boolean;
}

export interface PlayerSection {
  id: string;
  title: string;
  lessons: PlayerLesson[];
}

export interface CoursePlayerData {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  sections: PlayerSection[];
  /** Ids of lessons the current user has completed. */
  completedLessonIds: string[];
  progressPct: number;
  /** Lesson to open first (last watched or first incomplete). */
  initialLessonId: string;
}

/** A discussion comment under a lesson. */
export interface LessonComment {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  body: string;
  at: string;
}
