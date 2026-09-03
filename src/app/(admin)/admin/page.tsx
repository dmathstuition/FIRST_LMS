import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  BookOpen,
  ArrowRight,
  LifeBuoy,
  UserPlus,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import {
  getAdminStats,
  getRevenueSeries,
  getSignupSeries,
  getOrders,
  getTickets,
} from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatCompact } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

const orderStatusVariant = {
  paid: "success",
  pending: "warning",
  failed: "secondary",
  refunded: "secondary",
} as const;

export default async function AdminDashboardPage() {
  await requireRole(["admin"], "/admin");
  const [stats, revenue, signups, orders, tickets] = await Promise.all([
    getAdminStats(),
    getRevenueSeries(),
    getSignupSeries(),
    getOrders(),
    getTickets(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Admin Dashboard"
        description="Platform performance at a glance."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          accent="emerald"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total sales"
          value={formatCompact(stats.totalSales)}
          accent="primary"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={formatCompact(stats.totalStudents)}
          accent="accent"
        />
        <StatCard
          icon={UserPlus}
          label="New this month"
          value={formatCompact(stats.newUsersThisMonth)}
          accent="amber"
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={revenue} valuePrefix="₦" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New signups</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={signups} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {orders.slice(0, 5).map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{o.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.itemCount} item{o.itemCount === 1 ? "" : "s"} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={orderStatusVariant[o.status]}
                      className="capitalize"
                    >
                      {o.status}
                    </Badge>
                    <span className="w-20 text-right font-medium">
                      {formatCurrency(o.total, o.currency)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Support snapshot */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="size-4 text-primary" /> Support
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/tickets">All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.openTickets}</p>
            <p className="text-sm text-muted-foreground">open tickets</p>
            <ul className="mt-4 space-y-3">
              {tickets.slice(0, 3).map((t) => (
                <li key={t.id} className="text-sm">
                  <p className="truncate font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.userName}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/courses" icon={<BookOpen className="size-5" />} label="Manage courses" />
        <QuickLink href="/admin/users" icon={<Users className="size-5" />} label="Manage users" />
        <QuickLink href="/admin/coupons" icon={<DollarSign className="size-5" />} label="Create coupons" />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
        <ArrowRight className="ml-auto size-4 text-muted-foreground" />
      </Card>
    </Link>
  );
}
