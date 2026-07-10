import type { Metadata } from "next";
import { Star, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import {
  getRevenueSeries,
  getEnrollmentSeries,
  getInstructorCourses,
} from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics · Instructor" };

export default async function AnalyticsPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const [revenue, enrollments, courses] = await Promise.all([
    getRevenueSeries(user.id),
    getEnrollmentSeries(user.id),
    getInstructorCourses(user.id),
  ]);

  const byRevenue = [...courses].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Analytics"
        description="Understand what's driving your growth."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={revenue} valuePrefix="$" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={enrollments} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-semibold">Course performance</h2>
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_110px_90px_110px] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Course</span>
            <span className="text-right">Students</span>
            <span className="text-right">Rating</span>
            <span className="text-right">Revenue</span>
          </div>
          <ul className="divide-y">
            {byRevenue.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_110px_90px_110px] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{c.title}</span>
                  <Badge
                    variant={c.status === "published" ? "success" : "secondary"}
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                </div>
                <span className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  {formatCompact(c.studentCount)}
                </span>
                <span className="flex items-center justify-end gap-1 text-sm text-amber-500">
                  <Star className="size-3.5 fill-current" />
                  {c.ratingAvg.toFixed(1)}
                </span>
                <span className="text-right font-medium">
                  {formatCurrency(c.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
