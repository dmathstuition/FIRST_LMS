import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getStudentProgress } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Student Progress · Admin" };

export default async function AdminStudentsPage() {
  await requireRole(["admin"], "/admin");
  const students = await getStudentProgress();

  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((s, r) => s + r.progressPct, 0) / students.length,
        )
      : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Student Progress"
        description={
          students.length > 0
            ? `${students.length} enrollments · ${avgProgress}% average completion`
            : "Monitor how learners are progressing through your courses."
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No enrollments yet"
          description="Once students enroll, you'll be able to monitor their progress here."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="w-48">Progress</TableHead>
                <TableHead className="hidden md:table-cell">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {s.avatarUrl && <AvatarImage src={s.avatarUrl} alt="" />}
                        <AvatarFallback className="text-xs">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.courseTitle}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={s.progressPct} className="h-1.5" />
                      <span className="w-9 text-right text-xs text-muted-foreground">
                        {Math.round(s.progressPct)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {new Date(s.enrolledAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
