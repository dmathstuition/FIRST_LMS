"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { slugify } from "@/lib/utils";

/**
 * Blog management Server Actions (admin-only).
 *
 * Writes are additionally protected by the "Authors manage own posts" RLS
 * policy, so a non-admin session cannot mutate through these even if invoked.
 */

export type BlogActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

const postSchema = z.object({
  title: z.string().min(3, "Give the post a title").max(160),
  slug: z
    .string()
    .max(160)
    .optional()
    .or(z.literal("")),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  content: z.string().max(50_000).optional().or(z.literal("")),
  coverUrl: z.string().url("Cover must be a valid URL").optional().or(z.literal("")),
  tags: z.string().max(300).optional().or(z.literal("")),
  published: z.coerce.boolean().optional(),
});

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Create a new blog post. Redirects back to the admin blog list on success. */
export async function createPost(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverUrl: formData.get("coverUrl"),
    tags: formData.get("tags"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Post saved. (Connect Supabase to persist.)" };
  }

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { ok: false, message: "Not authorized." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const published = !!parsed.data.published;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("blog_posts").insert({
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt || null,
      content: parsed.data.content || null,
      cover_url: parsed.data.coverUrl || null,
      tags: parseTags(parsed.data.tags),
      author_id: user.id,
      published,
      published_at: published ? new Date().toISOString() : null,
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: "A post with that slug already exists." };
      }
      return { ok: false, message: error.message };
    }
  } catch {
    return { ok: false, message: "Could not create the post." };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

/** Update an existing blog post. */
export async function updatePost(
  postId: string,
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverUrl: formData.get("coverUrl"),
    tags: formData.get("tags"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Changes saved. (Connect Supabase to persist.)" };
  }

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { ok: false, message: "Not authorized." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const published = !!parsed.data.published;

  try {
    const supabase = await createClient();

    // Preserve the original published_at once set; stamp it the first time a
    // post goes live.
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", postId)
      .maybeSingle();
    const priorPublishedAt = (existing as { published_at: string | null } | null)
      ?.published_at;

    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content || null,
        cover_url: parsed.data.coverUrl || null,
        tags: parseTags(parsed.data.tags),
        published,
        published_at: published
          ? priorPublishedAt ?? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: "A post with that slug already exists." };
      }
      return { ok: false, message: error.message };
    }
  } catch {
    return { ok: false, message: "Could not save the post." };
  }

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true, message: "Post saved." };
}

/** Toggle a post between published and draft. */
export async function togglePostPublished(postId: string, publish: boolean) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase
    .from("blog_posts")
    .update({
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", postId);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

/** Delete a blog post. */
export async function deletePost(postId: string) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", postId);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
