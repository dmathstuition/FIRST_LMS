import type { Metadata } from "next";
import { DollarSign, TrendingUp, Clock, Download } from "lucide-react";

import { requireRole } from "@/lib/auth";
import {
  getInstructorStats,
  getInstructorEarnings,
  getRevenueSeries,
} from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings · Instructor" };

export default async function EarningsPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const [stats, earnings, revenue] = await Promise.all([
    getInstructorStats(user.id),
    getInstructorEarnings(user.id),
    getRevenueSeries(user.id),
  ]);

  const pending = earnings
    .slice(0, 3)
    .reduce((s, e) => s + e.net, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Earnings"
        description="Track your revenue and payouts."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Lifetime earnings"
          value={formatCurrency(stats.totalRevenue)}
          accent="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="This month"
          value={formatCurrency(stats.monthRevenue)}
          accent="primary"
        />
        <StatCard
          icon={Clock}
          label="Pending payout"
          value={formatCurrency(pending)}
          hint="Paid out monthly"
          accent="amber"
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Revenue over time</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={revenue} valuePrefix="$" />
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent transactions</h2>
        </div>
        {earnings.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No transactions yet"
            description="Sales will appear here once students start purchasing your courses."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1fr_1fr_100px_100px_110px] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Course</span>
              <span>Student</span>
              <span className="text-right">Gross</span>
              <span className="text-right">Net</span>
              <span className="text-right">Date</span>
            </div>
            <ul className="divide-y">
              {earnings.map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-2 gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_1fr_100px_100px_110px] sm:items-center sm:gap-4"
                >
                  <span className="truncate font-medium">{e.courseTitle}</span>
                  <span className="truncate text-muted-foreground">
                    {e.student}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {formatCurrency(e.gross)}
                  </span>
                  <span className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(e.net)}
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                    {new Date(e.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Download className="size-3.5" /> Detailed statements and CSV export
        arrive with live payments.
      </p>
    </div>
  );
}
