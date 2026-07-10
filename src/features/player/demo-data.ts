import type { CoursePlayerData, LessonComment, PlayerSection } from "./types";
import { demoCourses } from "@/features/courses/demo-data";

/**
 * Demo course-player curriculum, used when Supabase isn't connected so the
 * player is fully explorable. Mixes lesson types (native video, YouTube, text,
 * PDF) to exercise every renderer, and includes a transcript + resources.
 *
 * The native-video lesson uses a public sample MP4 so the custom control bar
 * (play, seek, speed, picture-in-picture, fullscreen) is demonstrable.
 */

const SAMPLE_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const transcript = `In this lesson we build intuition for the derivative.
Think of the derivative as an instantaneous rate of change — how fast a quantity
is changing at a single moment. We start with the average rate of change over an
interval, then shrink that interval toward zero. The value it approaches is the
derivative. Geometrically, it's the slope of the tangent line to the curve at a
point. Keep this picture in mind: zoom in far enough on any smooth curve and it
looks like a straight line — that line's slope is the derivative.`;

function buildCalculusSections(): PlayerSection[] {
  return [
    {
      id: "s1",
      title: "Foundations",
      lessons: [
        {
          id: "l1",
          sectionId: "s1",
          title: "Welcome & how to learn calculus",
          type: "video",
          video: { provider: "url", ref: SAMPLE_MP4 },
          body: null,
          transcript:
            "Welcome to the course! Here's how to get the most out of it: watch actively, pause to try problems yourself, and revisit lessons whenever you need to.",
          durationMinutes: 6,
          isPreview: true,
          resources: [
            { id: "r1", title: "Course syllabus (PDF)", url: "#", kind: "pdf" },
            { id: "r2", title: "Cheat sheet", url: "#", kind: "download" },
          ],
          completed: true,
        },
        {
          id: "l2",
          sectionId: "s1",
          title: "What is a limit? (intuition first)",
          type: "youtube",
          video: { provider: "youtube", ref: "riXcZT2ICjA" },
          body: null,
          transcript:
            "A limit describes the value a function approaches as the input approaches some point — even if the function isn't defined exactly there.",
          durationMinutes: 9,
          isPreview: true,
          resources: [],
          completed: true,
        },
      ],
    },
    {
      id: "s2",
      title: "Derivatives",
      lessons: [
        {
          id: "l3",
          sectionId: "s2",
          title: "The derivative as a rate of change",
          type: "video",
          video: { provider: "url", ref: SAMPLE_MP4 },
          body: null,
          transcript,
          durationMinutes: 12,
          isPreview: false,
          resources: [
            { id: "r3", title: "Worked examples (PDF)", url: "#", kind: "pdf" },
          ],
          completed: false,
        },
        {
          id: "l4",
          sectionId: "s2",
          title: "Reading: differentiation rules",
          type: "text",
          video: null,
          body: `The power rule, product rule, quotient rule, and chain rule are the four workhorses of differentiation.

The power rule: d/dx[x^n] = n·x^(n-1). This single rule covers polynomials.

The product rule: d/dx[f·g] = f'·g + f·g'. Use it when two functions are multiplied.

The chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x). This is the most important rule for composite functions — practice it until it's automatic.`,
          transcript: null,
          durationMinutes: 8,
          isPreview: false,
          resources: [],
          completed: false,
        },
      ],
    },
    {
      id: "s3",
      title: "Integration",
      lessons: [
        {
          id: "l5",
          sectionId: "s3",
          title: "The fundamental theorem of calculus",
          type: "video",
          video: { provider: "url", ref: SAMPLE_MP4 },
          body: null,
          transcript:
            "The fundamental theorem links differentiation and integration: integration is the reverse of differentiation.",
          durationMinutes: 14,
          isPreview: false,
          resources: [
            { id: "r4", title: "Practice set (PDF)", url: "#", kind: "pdf" },
          ],
          completed: false,
        },
        {
          id: "l6",
          sectionId: "s3",
          title: "Reference: integral tables",
          type: "pdf",
          video: null,
          body: "#",
          transcript: null,
          durationMinutes: 5,
          isPreview: false,
          resources: [],
          completed: false,
        },
      ],
    },
  ];
}

/** Build player data for any demo course slug (rich curriculum for calculus). */
export function getDemoPlayerData(slug: string): CoursePlayerData | null {
  const course = demoCourses.find((c) => c.slug === slug) ?? demoCourses[0];
  if (!course) return null;

  const sections =
    slug === "calculus-made-intuitive"
      ? buildCalculusSections()
      : buildCalculusSections().slice(0, 2); // generic shorter curriculum

  const all = sections.flatMap((s) => s.lessons);
  const completed = all.filter((l) => l.completed).map((l) => l.id);
  const firstIncomplete = all.find((l) => !l.completed) ?? all[0];

  return {
    course: { id: course.id, slug: course.slug, title: course.title },
    sections,
    completedLessonIds: completed,
    progressPct: Math.round((completed.length / all.length) * 100),
    initialLessonId: firstIncomplete.id,
  };
}

export const demoComments: LessonComment[] = [
  {
    id: "c1",
    authorName: "Amara Nwosu",
    authorAvatar: null,
    body: "The tangent-line explanation finally made this click for me. Thank you!",
    at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "c2",
    authorName: "Daniel Park",
    authorAvatar: null,
    body: "Could you add a worked example for the chain rule with trig functions?",
    at: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];
