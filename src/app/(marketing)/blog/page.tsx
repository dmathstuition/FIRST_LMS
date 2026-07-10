import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Learning strategies, study tips, and insights from the D-MATHS Learning Hub team.",
  alternates: { canonical: "/blog" },
};

// Demo blog posts (the full blog CMS with a rich-text editor lands in a later
// phase; the DB already has blog_posts/blog_categories tables ready).
const posts = [
  {
    slug: "how-to-actually-understand-math",
    title: "How to actually understand math (not just memorize it)",
    excerpt:
      "The secret to lasting mathematical skill isn't more practice problems — it's building intuition. Here's how.",
    cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop",
    category: "Learning",
    date: "2026-06-28",
    readMins: 6,
  },
  {
    slug: "learn-to-code-in-2026",
    title: "The realistic roadmap to learning to code in 2026",
    excerpt:
      "Skip the tutorial hell. This is the exact path from zero to shipping real full-stack applications.",
    cover: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
    category: "Web Development",
    date: "2026-06-15",
    readMins: 9,
  },
  {
    slug: "study-habits-that-stick",
    title: "7 evidence-based study habits that actually stick",
    excerpt:
      "Spaced repetition, active recall, and more — the science-backed techniques top learners swear by.",
    cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop",
    category: "Productivity",
    date: "2026-05-30",
    readMins: 5,
  },
];

export default function BlogPage() {
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

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.06}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <Badge variant="secondary" className="w-fit">
                  {post.category}
                </Badge>
                <h2 className="mt-3 line-clamp-2 text-lg font-semibold group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(post.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    • {post.readMins} min read
                  </span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
