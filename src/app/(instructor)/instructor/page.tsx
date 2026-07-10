import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import {
  getInstructorStats,
  getInstructorCourses,
  getInstructorReviews,
  getRevenueSeries,
} from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatCompact, getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Instructor Overview" };

export default async function InstructorOverviewPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const [stats, courses, reviews, revenue] = await Promise.all([
    getInstructorStats(user.id),
    getInstructorCourses(user.id),
    getInstructorReviews(user.id),
    getRevenueSeries(user.id),
  ]);

  const topCourses = [...courses]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
  const firstName = user.fullName?.split(" ")[0] ?? "Instructor";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's how your courses are performing."
      >
        <Button asChild variant="gradient">
          <Link href="/instructor/courses/new">
            <Plus className="size-4" /> New course
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total students"
          value={formatCompact(stats.totalStudents)}
          accent="primary"
        />
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          accent="emerald"
        />
        <StatCard
          icon={BookOpen}
          label="Published courses"
          value={`${stats.publishedCourses}/${stats.totalCourses}`}
          accent="accent"
        />
        <StatCard
          icon={Star}
          label="Average rating"
          value={stats.avgRating.toFixed(1)}
          accent="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-emerald-500" /> Revenue (last 7 months)
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/instructor/analytics">
                Details <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <BarChart data={revenue} valuePrefix="$" />
          </CardContent>
        </Card>

        {/* Recent reviews */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent reviews</CardTitle>
            <Link
              href="/instructor/reviews"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(r.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {r.studentName}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="size-3 fill-current" />
                          {r.rating}
                        </span>
                      </div>
                      {r.content && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {r.content}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top courses */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Top performing courses</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/instructor/courses">
              All courses <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <Card>
          <div className="divide-y">
            {topCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{course.title}</p>
                    <Badge
                      variant={course.status === "published" ? "success" : "secondary"}
                      className="capitalize"
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCompact(course.studentCount)} students
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(course.revenue)}
                  </p>
                  <p className="flex items-center justify-end gap-0.5 text-xs text-amber-500">
                    <Star className="size-3 fill-current" />
                    {course.ratingAvg.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
