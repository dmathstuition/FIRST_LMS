import type { Metadata } from "next";
import { Trash2, Megaphone, Mail } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAnnouncements, getSubscribers } from "@/features/announcements/queries";
import { deleteAnnouncement } from "@/features/announcements/actions";
import { AnnouncementForm } from "@/features/announcements/components/announcement-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Announcements · Admin" };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminAnnouncementsPage() {
  await requireRole(["admin"], "/admin");
  const [announcements, subscribers] = await Promise.all([
    getAnnouncements(50),
    getSubscribers(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Announcements"
        description="Post updates to your learners and grow your mailing list."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post an announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementForm />
            </CardContent>
          </Card>

          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Your posted announcements appear here and on your learners' dashboards."
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{a.title}</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                        {a.body}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <form action={deleteAnnouncement.bind(null, a.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${a.title}`}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter subscribers */}
        <div>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-primary" /> Subscribers
              </CardTitle>
              <Badge variant="secondary">{subscribers.length}</Badge>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subscribers yet. The footer signup form feeds this list.
                </p>
              ) : (
                <ul className="space-y-2">
                  {subscribers.slice(0, 25).map((s) => (
                    <li key={s.id} className="truncate text-sm" title={s.email}>
                      {s.email}
                    </li>
                  ))}
                  {subscribers.length > 25 && (
                    <li className="text-xs text-muted-foreground">
                      + {subscribers.length - 25} more
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
