import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { getAdminPostById } from "@/features/blog/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/features/blog/components/post-form";

export const metadata: Metadata = { title: "Edit post · Admin" };

type Params = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Params) {
  await requireRole(["admin"], "/admin");
  const { id } = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit Post" description="Update and republish this article.">
        {post.published && (
          <Button asChild variant="outline">
            <Link href={`/blog/${post.slug}`} target="_blank">
              View live <ExternalLink className="size-4" />
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <PostForm
            postId={post.id}
            storageEnabled={integrations.supabase}
            defaults={{
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt ?? "",
              content: post.content ?? "",
              coverUrl: post.coverUrl ?? "",
              tags: post.tags,
              published: post.published,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
