import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/features/blog/queries";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = (post.content ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="container max-w-3xl py-12 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to blog
      </Link>

      <header className="mt-6">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          {post.author?.fullName && (
            <>
              <span aria-hidden>·</span>
              <span>{post.author.fullName}</span>
            </>
          )}
        </div>
      </header>

      {post.coverUrl && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border bg-muted">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-8 text-lg font-medium text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="mt-6 space-y-5 leading-relaxed text-foreground/90">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground">This post has no content yet.</p>
        )}
      </div>

      <footer className="mt-12 border-t pt-8">
        <p className="text-sm text-muted-foreground">
          Enjoyed this? Explore courses at{" "}
          <Link href="/courses" className="font-medium text-primary hover:underline">
            {siteConfig.shortName}
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
