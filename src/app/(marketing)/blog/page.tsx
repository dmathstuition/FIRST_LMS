import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getPublishedPosts } from "@/features/blog/queries";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Learning strategies, study tips, and insights from the D-MATHS Learning Hub team.",
  alternates: { canonical: "/blog" },
};

// Always render fresh so newly published posts appear without a rebuild.
export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="container py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The D-MATHS Blog
        </h1>
        <p className="mt-3 text-muted-foreground">
          Learning strategies, study tips, and insights to help you learn faster.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="mx-auto mt-12 max-w-xl">
          <EmptyState
            icon={Newspaper}
            title="No posts yet"
            description="We're working on our first articles. Check back soon for learning strategies, study tips and updates from D-MATHS."
            actionLabel="Browse courses"
            actionHref="/courses"
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.06}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {post.coverUrl ? (
                    <Image
                      src={post.coverUrl}
                      alt={post.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-gradient/10 text-primary">
                      <Newspaper className="size-10" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {post.tags[0] && (
                    <Badge variant="secondary" className="w-fit">
                      {post.tags[0]}
                    </Badge>
                  )}
                  <h2 className="mt-3 line-clamp-2 text-lg font-semibold group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
