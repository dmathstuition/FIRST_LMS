import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminCourses } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { FeatureToggle } from "@/features/admin/components/feature-toggle";

export const metadata: Metadata = { title: "Courses · Admin" };

const statusVariant = {
  published: "success",
  draft: "secondary",
  archived: "secondary",
} as const;

export default async function AdminCoursesPage() {
  await requireRole(["admin"], "/admin");
  const courses = await getAdminCourses();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Courses"
        description={`${courses.length} courses across the platform.`}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="hidden md:table-cell">Instructor</TableHead>
              <TableHead className="hidden sm:table-cell">Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium">{c.title}</p>
                  {c.categoryName && (
                    <p className="text-xs text-muted-foreground">
                      {c.categoryName}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {c.instructorName}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatCompact(c.studentCount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[c.status]} className="capitalize">
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {c.price === 0 ? "Free" : formatCurrency(c.price)}
                </TableCell>
                <TableCell>
                  <FeatureToggle courseId={c.id} featured={c.isFeatured} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-muted-foreground hover:text-primary"
                    aria-label="View course"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
