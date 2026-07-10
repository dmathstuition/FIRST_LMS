import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  Zap,
  ArrowRight,
  Trophy,
  PlayCircle,
  GraduationCap,
  Target,
  Rocket,
  Moon,
  type LucideIcon,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import {
  getStudentStats,
  getEnrolledCourses,
  getRecentActivity,
  getBadges,
} from "@/features/dashboard/queries";
import { EnrolledCourseCard } from "@/components/dashboard/enrolled-course-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// Icon lookup for badge slugs (mirrors seeded badge icons).
const badgeIcons: Record<string, LucideIcon> = {
  Rocket,
  Trophy,
  Flame,
  Target,
  Moon,
  GraduationCap,
  Award,
};

const activityIcons: Record<string, LucideIcon> = {
  lesson: PlayCircle,
  quiz: Target,
  certificate: Award,
  enrollment: BookOpen,
  badge: Trophy,
};

export default async function DashboardHomePage() {
  const user = await requireUser();
  const [stats, enrolled, activity, badges] = await Promise.all([
    getStudentStats(user.id),
    getEnrolledCourses(user.id),
    getRecentActivity(user.id),
    getBadges(user.id),
  ]);

  const inProgress = enrolled.filter((c) => c.status === "active");
  const continueCourse = inProgress[0];
  const firstName = user.fullName?.split(" ")[0] ?? "there";
  const earnedBadges = badges.filter((b) => b.earned);
  // Weekly goal: 150 minutes; approximate this week's minutes from hours learned.
  const weeklyGoalMins = 150;
  const weekMins = Math.min(weeklyGoalMins, stats.hoursLearned * 12);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {inProgress.length > 0
            ? "Pick up right where you left off."
            : "Ready to start learning something new?"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Enrolled courses"
          value={stats.coursesEnrolled}
          accent="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.coursesCompleted}
          accent="emerald"
        />
        <StatCard
          icon={Clock}
          label="Hours learned"
          value={stats.hoursLearned}
          accent="accent"
        />
        <StatCard
          icon={Flame}
          label="Day streak"
          value={stats.currentStreak}
          hint="Keep it going!"
          accent="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Continue learning + in-progress */}
        <div className="space-y-6 lg:col-span-2">
          {continueCourse ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-video w-full shrink-0 bg-muted sm:w-56">
                  <div className="animated-gradient absolute inset-0 opacity-90" />
                  <PlayCircle className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Continue learning
                  </span>
                  <h2 className="mt-1 text-lg font-semibold">
                    {continueCourse.title}
                  </h2>
                  {continueCourse.lastLessonTitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Up next: {continueCourse.lastLessonTitle}
                    </p>
                  )}
                  <div className="mt-3 space-y-1.5">
                    <Progress value={continueCourse.progressPct} />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(continueCourse.progressPct)}% complete
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="gradient"
                    className="mt-4 w-fit"
                  >
                    <Link href={`/learn/${continueCourse.slug}`}>
                      Resume <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="You're not enrolled in any courses yet"
              description="Browse our catalog and start learning something new today."
              actionLabel="Browse courses"
              actionHref="/courses"
            />
          )}

          {inProgress.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">In progress</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/courses">
                    View all <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {inProgress.slice(0, 2).map((course) => (
                  <EnrolledCourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar column: XP + goal + activity + badges */}
        <div className="space-y-6">
          {/* XP + weekly goal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="size-4 text-amber-500" /> Your progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="text-xl font-bold">
                  {stats.xpPoints.toLocaleString()}
                </span>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Weekly goal</span>
                  <span className="font-medium">
                    {weekMins}/{weeklyGoalMins} min
                  </span>
                </div>
                <Progress value={(weekMins / weeklyGoalMins) * 100} />
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <ul className="space-y-4">
                  {activity.slice(0, 5).map((item) => {
                    const Icon = activityIcons[item.type] ?? PlayCircle;
                    return (
                      <li key={item.id} className="flex gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{item.title}</p>
                          {item.courseTitle && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.courseTitle}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start a lesson to see it here.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Badges preview */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Achievements</CardTitle>
              <Link
                href="/dashboard/achievements"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badges.slice(0, 6).map((badge) => {
                  const Icon = badgeIcons[badge.icon] ?? Award;
                  return (
                    <div
                      key={badge.id}
                      title={`${badge.name} — ${badge.description}`}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-xl border transition-transform hover:scale-105",
                        badge.earned
                          ? "bg-brand-gradient text-white shadow-sm"
                          : "bg-muted text-muted-foreground opacity-50",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {earnedBadges.length} of {badges.length} badges earned
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
