import type { Metadata } from "next";
import {
  Zap,
  Flame,
  Trophy,
  Award,
  Rocket,
  Target,
  Moon,
  GraduationCap,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getBadges, getStudentStats } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements" };

const badgeIcons: Record<string, LucideIcon> = {
  Rocket,
  Trophy,
  Flame,
  Target,
  Moon,
  GraduationCap,
  Award,
};

// XP levels: every 1,000 XP is a new level.
const XP_PER_LEVEL = 1000;

export default async function AchievementsPage() {
  const user = await requireUser();
  const [stats, badges] = await Promise.all([
    getStudentStats(user.id),
    getBadges(user.id),
  ]);

  const level = Math.floor(stats.xpPoints / XP_PER_LEVEL) + 1;
  const xpIntoLevel = stats.xpPoints % XP_PER_LEVEL;
  const earned = badges.filter((b) => b.earned);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Achievements"
        description="Level up, earn badges, and keep your streak alive."
      />

      {/* Level + streak */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 sm:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Zap className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">Level {level}</p>
              <p className="text-sm text-muted-foreground">
                {stats.xpPoints.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress to level {level + 1}</span>
              <span>
                {xpIntoLevel}/{XP_PER_LEVEL}
              </span>
            </div>
            <Progress value={(xpIntoLevel / XP_PER_LEVEL) * 100} />
          </div>
        </Card>

        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${stats.currentStreak} days`}
          hint="Learn today to extend it"
          accent="amber"
        />
        <StatCard
          icon={Trophy}
          label="Badges earned"
          value={`${earned.length} / ${badges.length}`}
          accent="primary"
        />
      </div>

      {/* Badges grid */}
      <h2 className="mb-4 mt-8 font-semibold">Badges</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => {
          const Icon = badgeIcons[badge.icon] ?? Award;
          return (
            <Card
              key={badge.id}
              className={cn(
                "flex items-start gap-4 p-5 transition-all",
                badge.earned ? "hover:shadow-md" : "opacity-70",
              )}
            >
              <span
                className={cn(
                  "relative flex size-12 shrink-0 items-center justify-center rounded-xl",
                  badge.earned
                    ? "bg-brand-gradient text-white shadow-sm"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-6" />
                {!badge.earned && (
                  <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-muted-foreground/80 text-white">
                    <Lock className="size-2.5" />
                  </span>
                )}
              </span>
              <div>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="mt-1 text-xs text-primary">
                    Earned{" "}
                    {new Date(badge.earnedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
