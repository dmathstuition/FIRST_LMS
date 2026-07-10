import type { Metadata } from "next";
import { Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getInstructorStudents } from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Students · Instructor" };

export default async function StudentsPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const students = await getInstructorStudents(user.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Students"
        description={`${students.length} learners across your courses.`}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="When learners enroll in your courses they'll appear here so you can track their progress."
        />
      ) : (
        <Card className="overflow-hidden">
          {/* Header row (desktop) */}
          <div className="hidden grid-cols-[1fr_1fr_140px_120px] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Student</span>
            <span>Course</span>
            <span>Progress</span>
            <span>Enrolled</span>
          </div>
          <ul className="divide-y">
            {students.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_140px_120px] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    {s.avatarUrl && <AvatarImage src={s.avatarUrl} alt="" />}
                    <AvatarFallback className="text-xs">
                      {getInitials(s.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {s.courseTitle}
                </span>
                <div className="flex items-center gap-2">
                  <Progress value={s.progressPct} className="h-1.5" />
                  <span className="w-9 text-right text-xs text-muted-foreground">
                    {Math.round(s.progressPct)}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.enrolledAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
