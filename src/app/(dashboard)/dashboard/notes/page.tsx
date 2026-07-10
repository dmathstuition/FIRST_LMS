import type { Metadata } from "next";
import { StickyNote } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Notes & Bookmarks" };

export default async function NotesPage() {
  // Enforce auth; notes/bookmarks are created inside the course player (Phase 8),
  // which writes to the `notes` and `bookmarks` tables (already in the schema).
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notes & Bookmarks"
        description="Everything you've saved while learning, in one place."
      />
      <EmptyState
        icon={StickyNote}
        title="No notes or bookmarks yet"
        description="While watching a lesson you can take timestamped notes and bookmark key moments — they'll all collect here."
        actionLabel="Go to my courses"
        actionHref="/dashboard/courses"
      />
    </div>
  );
}
