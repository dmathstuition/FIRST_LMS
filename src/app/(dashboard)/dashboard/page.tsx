import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, GraduationCap, LogOut } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Authenticated landing target. Intentionally minimal in the foundation build —
 * the full student dashboard (courses, progress, achievements) arrives in Phase 5.
 * This is fully functional: it enforces auth and reflects the real session user.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="container max-w-4xl py-12">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback>{getInitials(user.fullName ?? "U")}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {user.fullName ?? "learner"} 👋
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.email}</span>
              <Badge variant="accent" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickCard
          href="/courses"
          icon={<Compass className="size-5" />}
          title="Browse courses"
          desc="Discover new skills to learn"
        />
        <QuickCard
          href="/#pricing"
          icon={<BookOpen className="size-5" />}
          title="My learning"
          desc="Continue where you left off"
        />
        <QuickCard
          href="/verify"
          icon={<GraduationCap className="size-5" />}
          title="Certificates"
          desc="View and verify your certificates"
        />
      </div>

      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle>Your full dashboard is coming online</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Course progress, achievements, quizzes, assignments, and analytics are
          rolling out next. Your account, authentication, and enrollment data are
          already live and secured with row-level security.
        </CardContent>
      </Card>
    </div>
  );
}

function QuickCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <p className="font-semibold group-hover:text-primary">{title}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
