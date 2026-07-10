"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import { slugify } from "@/lib/utils";

/**
 * Instructor course-authoring Server Actions. All writes are scoped by RLS
 * (`owns_course()` / instructor_id = auth.uid()), so no manual ownership checks
 * are required here. When Supabase isn't configured they no-op with a friendly
 * message so the authoring UX is fully demonstrable.
 */

export type FormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

const courseSchema = z.object({
  title: z.string().min(3, "Give your course a title").max(120),
  subtitle: z.string().max(160).optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]).default("all"),
  price: z.coerce.number().min(0).max(9999),
  description: z.string().max(4000).optional().or(z.literal("")),
});

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Create a new (draft) course and redirect to its builder. */
export async function createCourse(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    categoryId: formData.get("categoryId"),
    level: formData.get("level") ?? "all",
    price: formData.get("price") ?? 0,
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!integrations.supabase) {
    return {
      ok: true,
      message:
        "Course drafted. Connect Supabase to persist it and add lessons.",
    };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "You must be signed in." };

  const supabase = await createClient();
  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      description: parsed.data.description || null,
      category_id: parsed.data.categoryId || null,
      level: parsed.data.level,
      price: parsed.data.price,
      instructor_id: userId,
      slug,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not create course." };
  }

  revalidatePath("/instructor/courses");
  redirect(`/instructor/courses/${(data as { id: string }).id}`);
}

/** Update core course details. */
export async function updateCourse(
  courseId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    categoryId: formData.get("categoryId"),
    level: formData.get("level") ?? "all",
    price: formData.get("price") ?? 0,
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!integrations.supabase) {
    return { ok: true, message: "Saved. (Connect Supabase to persist.)" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      description: parsed.data.description || null,
      category_id: parsed.data.categoryId || null,
      level: parsed.data.level,
      price: parsed.data.price,
    })
    .eq("id", courseId);

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/instructor/courses/${courseId}`);
  return { ok: true, message: "Course details saved." };
}

/** Toggle a course between draft and published. */
export async function setCourseStatus(courseId: string, publish: boolean) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", courseId);
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/instructor/courses");
}

/** Add a curriculum section to a course. */
export async function addSection(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  if (!integrations.supabase) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("sections")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase.from("sections").insert({
    course_id: courseId,
    title,
    sort_order: count ?? 0,
  });
  revalidatePath(`/instructor/courses/${courseId}`);
}

/** Payload shape for the quiz builder. */
export interface QuizPayload {
  title: string;
  passPct: number;
  questions: {
    type: "multiple_choice" | "true_false";
    prompt: string;
    points: number;
    options: { content: string; isCorrect: boolean }[];
  }[];
}

const quizPayloadSchema = z.object({
  title: z.string().min(3).max(160),
  passPct: z.number().min(0).max(100),
  questions: z
    .array(
      z.object({
        type: z.enum(["multiple_choice", "true_false"]),
        prompt: z.string().min(1),
        points: z.number().min(1).max(100),
        options: z
          .array(
            z.object({
              content: z.string().min(1),
              isCorrect: z.boolean(),
            }),
          )
          .min(2),
      }),
    )
    .min(1, "Add at least one question"),
});

/**
 * Persist a quiz (title + questions + options) for a course. Called directly
 * from the quiz builder client component. Writes are RLS-scoped to the course
 * owner. No-ops with a message when Supabase isn't configured.
 */
export async function saveQuiz(
  courseId: string,
  payload: QuizPayload,
): Promise<FormState> {
  const parsed = quizPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid quiz",
    };
  }

  if (!integrations.supabase) {
    return {
      ok: true,
      message: `Quiz saved with ${parsed.data.questions.length} question(s). (Connect Supabase to persist.)`,
    };
  }

  try {
    const supabase = await createClient();
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        title: parsed.data.title,
        pass_pct: parsed.data.passPct,
      })
      .select("id")
      .single();

    if (error || !quiz) {
      return { ok: false, message: error?.message ?? "Could not save quiz." };
    }
    const quizId = (quiz as { id: string }).id;

    // Insert questions, then their options, preserving order.
    for (let i = 0; i < parsed.data.questions.length; i++) {
      const q = parsed.data.questions[i];
      const { data: question, error: qErr } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizId,
          type: q.type,
          prompt: q.prompt,
          points: q.points,
          sort_order: i,
        })
        .select("id")
        .single();
      if (qErr || !question) continue;

      const questionId = (question as { id: string }).id;
      await supabase.from("question_options").insert(
        q.options.map((o, j) => ({
          question_id: questionId,
          content: o.content,
          is_correct: o.isCorrect,
          sort_order: j,
        })),
      );
    }

    revalidatePath(`/instructor/courses/${courseId}`);
    return { ok: true, message: "Quiz saved successfully." };
  } catch {
    return { ok: false, message: "Something went wrong saving the quiz." };
  }
}

/** Add a lesson to a section. */
export async function addLesson(
  courseId: string,
  sectionId: string,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "video");
  if (!title) return;
  if (!integrations.supabase) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId);

  await supabase.from("lessons").insert({
    course_id: courseId,
    section_id: sectionId,
    title,
    type,
    sort_order: count ?? 0,
  });
  revalidatePath(`/instructor/courses/${courseId}`);
}
