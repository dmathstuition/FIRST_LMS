import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, Trash2, Newspaper, Eye, EyeOff } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminPosts } from "@/features/blog/queries";
import { deletePost, togglePostPublished } from "@/features/blog/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Blog · Admin" };

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBlogPage() {
  await requireRole(["admin"], "/admin");
  const posts = await getAdminPosts();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Blog"
        description="Write and publish articles for the public blog."
      >
        <Button asChild variant="gradient">
          <Link href="/admin/blog/new">
            <Plus className="size-4" /> New post
          </Link>
        </Button>
      </PageHeader>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Write your first article. Drafts stay private until you publish them."
          actionLabel="Write a post"
          actionHref="/admin/blog/new"
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={post.published ? "success" : "secondary"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.published
                      ? formatDate(post.publishedAt)
                      : `Updated ${formatDate(post.updatedAt)}`}
                  </span>
                </div>
                <p className="mt-2 truncate font-medium">{post.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  /blog/{post.slug}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form
                  action={togglePostPublished.bind(
                    null,
                    post.id,
                    !post.published,
                  )}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? (
                      <>
                        <EyeOff className="size-4" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="size-4" /> Publish
                      </>
                    )}
                  </Button>
                </form>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/blog/${post.id}`}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </Button>
                <form action={deletePost.bind(null, post.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${post.title}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
