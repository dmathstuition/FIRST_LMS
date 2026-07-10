import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  CreditCard,
  Trophy,
  MessageSquare,
  FileText,
  Info,
  type LucideIcon,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types";

export const metadata: Metadata = { title: "Notifications" };

const typeIcons: Record<NotificationKind, LucideIcon> = {
  system: Info,
  course: BookOpen,
  payment: CreditCard,
  assignment: FileText,
  quiz: FileText,
  message: MessageSquare,
  achievement: Trophy,
};

/** Relative time formatter (e.g. "2h ago"). */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Stay on top of your courses, payments, and achievements."
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New notifications about your courses and account will show up here."
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] ?? Info;
            const body = (
              <div
                className={cn(
                  "flex gap-4 p-4 transition-colors hover:bg-accent/5",
                  !n.read && "bg-primary/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    n.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{n.title}</p>
                    {!n.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {timeAgo(n.at)}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.link ? <Link href={n.link}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
