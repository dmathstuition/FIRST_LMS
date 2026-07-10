import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getInstructorMessages } from "@/features/instructor/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages · Instructor" };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function MessagesPage() {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const threads = await getInstructorMessages(user.id);
  const unread = threads.filter((t) => t.unread).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Messages"
        description={
          unread > 0 ? `${unread} unread message${unread === 1 ? "" : "s"}` : "Chat with your students."
        }
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="When students message you about your courses, conversations will appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/5",
                    t.unread && "bg-primary/[0.03]",
                  )}
                >
                  <Avatar>
                    {t.fromAvatar && <AvatarImage src={t.fromAvatar} alt="" />}
                    <AvatarFallback>{getInitials(t.fromName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{t.fromName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(t.at)}
                      </span>
                    </div>
                    {t.courseTitle && (
                      <p className="text-xs text-primary">{t.courseTitle}</p>
                    )}
                    <p
                      className={cn(
                        "mt-0.5 truncate text-sm",
                        t.unread
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.preview}
                    </p>
                  </div>
                  {t.unread && (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
