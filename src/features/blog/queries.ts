import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

/**
 * Blog queries.
 *
 * The blog is fully DB-backed and authored by D-MATHS in the admin portal.
 * There is no demo/sample content: an unconfigured or empty database returns an
 * empty list so the public blog shows a clean "coming soon" empty state until
 * the first post is published.
 */

export type BlogPostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  author: { fullName: string | null; avatarUrl: string | null } | null;
};

export type BlogPost = BlogPostCard & {
  content: string | null;
  published: boolean;
  updatedAt: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
};

const POST_SELECT = `
  id, slug, title, excerpt, content, cover_url, tags, published,
  published_at, created_at, updated_at,
  author:author_id ( full_name, avatar_url )
`;

function mapPost(row: PostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverUrl: row.cover_url,
    tags: row.tags ?? [],
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author
      ? { fullName: row.author.full_name, avatarUrl: row.author.avatar_url }
      : null,
  };
}

/** Published posts for the public /blog index, newest first. */
export async function getPublishedPosts(): Promise<BlogPostCard[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_SELECT)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as PostRow[]).map(mapPost);
  } catch {
    return [];
  }
}

/** A single published post by slug for /blog/[slug]. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!integrations.supabase) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_SELECT)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) return null;
    return mapPost(data as unknown as PostRow);
  } catch {
    return null;
  }
}

/** Slugs of published posts, for other published posts to link to (nav). */
export async function getPublishedSlugs(): Promise<string[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("published", true);
    if (error || !data) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
  } catch {
    return [];
  }
}

/* ------------------------------- admin views ------------------------------ */

/** Every post (published + draft) for the admin blog list, newest first. */
export async function getAdminPosts(): Promise<BlogPost[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as PostRow[]).map(mapPost);
  } catch {
    return [];
  }
}

/** One post by id for the admin editor (any publish state). */
export async function getAdminPostById(id: string): Promise<BlogPost | null> {
  if (!integrations.supabase) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapPost(data as unknown as PostRow);
  } catch {
    return null;
  }
}
