import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, Trash2, Rocket, Eye, EyeOff, CalendarDays } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminPrograms } from "@/features/programs/queries";
import { deleteProgram, toggleProgramPublished } from "@/features/programs/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Programs · Admin" };

function formatDate(value: string | null) {
  if (!value) return "No date set";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminProgramsPage() {
  await requireRole(["admin"], "/admin");
  const programs = await getAdminPrograms();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Programs"
        description="Create and manage your live, cohort-based programs."
      >
        <Button asChild variant="gradient">
          <Link href="/admin/programs/new">
            <Plus className="size-4" /> New program
          </Link>
        </Button>
      </PageHeader>

      {programs.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No programs yet"
          description="Create your first cohort. Drafts stay private until you publish them."
          actionLabel="Create a program"
          actionHref="/admin/programs/new"
        />
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "published" ? "success" : "secondary"}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatDate(p.startDate)}
                  </span>
                </div>
                <p className="mt-2 truncate font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.format}
                  {p.location ? ` · ${p.location}` : ""} ·{" "}
                  {(p.discountPrice ?? p.price) > 0
                    ? formatCurrency(p.discountPrice ?? p.price, p.currency)
                    : "Free"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form
                  action={toggleProgramPublished.bind(
                    null,
                    p.id,
                    p.status !== "published",
                  )}
                >
                  <Button type="submit" variant="ghost" size="sm">
                    {p.status === "published" ? (
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
                  <Link href={`/admin/programs/${p.id}`}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </Button>
                <form action={deleteProgram.bind(null, p.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${p.title}`}
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
