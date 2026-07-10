import type { Metadata } from "next";
import { Trash2, FolderTree } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminCategories } from "@/features/admin/queries";
import { deleteCategory } from "@/features/admin/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/features/admin/components/category-form";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  await requireRole(["admin"], "/admin");
  const categories = await getAdminCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Categories"
        description="Organize your catalog into browsable categories."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add a category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {categories.map((c) => (
          <Card
            key={c.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderTree className="size-5" />
              </span>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{c.courseCount} courses</Badge>
              <form action={deleteCategory.bind(null, c.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
