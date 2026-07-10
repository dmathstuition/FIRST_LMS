import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAuditLogs } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Audit Logs · Admin" };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function AdminAuditPage() {
  await requireRole(["admin"], "/admin");
  const logs = await getAuditLogs();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Audit Logs"
        description="A record of important actions taken across the platform."
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries yet"
          description="Administrative and content actions will be logged here."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center gap-3 px-5 py-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ScrollText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {log.action}
                    </Badge>
                    {log.entity && (
                      <span className="truncate text-sm">{log.entity}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    by {log.actorName}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(log.at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
