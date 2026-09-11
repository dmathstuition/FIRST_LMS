import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PostForm } from "@/features/blog/components/post-form";

export const metadata: Metadata = { title: "New post · Admin" };

export default async function NewBlogPostPage() {
  await requireRole(["admin"], "/admin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New Post"
        description="Draft an article. It stays private until you publish it."
      />
      <Card>
        <CardContent className="pt-6">
          <PostForm storageEnabled={integrations.supabase} />
        </CardContent>
      </Card>
    </div>
  );
}
