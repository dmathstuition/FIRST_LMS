import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getTickets } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Support Tickets · Admin" };

const statusVariant = {
  open: "warning",
  pending: "default",
  resolved: "success",
  closed: "secondary",
} as const;

export default async function AdminTicketsPage() {
  await requireRole(["admin"], "/admin");
  const tickets = await getTickets();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Support Tickets"
        description={`${tickets.filter((t) => t.status === "open").length} open of ${tickets.length} total.`}
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No tickets"
          description="Support requests from users will show up here."
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card
              key={t.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {t.userName} ·{" "}
                  {new Date(t.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge variant={statusVariant[t.status]} className="capitalize">
                {t.status}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
