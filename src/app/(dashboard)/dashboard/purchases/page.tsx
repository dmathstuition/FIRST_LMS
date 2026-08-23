import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, PlayCircle } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getPurchases } from "@/features/dashboard/queries";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PrintButton } from "@/components/dashboard/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Purchases" };

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  paid: "success",
  pending: "warning",
  refunded: "secondary",
  failed: "warning",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PurchasesPage() {
  const user = await requireUser();
  const purchases = await getPurchases(user.id);

  const totalPaid = purchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Purchases"
        description="Your order history, receipts, and invoices."
      />

      {purchases.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No purchases yet"
          description="When you buy a course your receipts and downloadable invoices will appear here."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-sm">
            <div>
              <p className="text-sm text-muted-foreground">Total spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {purchases.length} order{purchases.length === 1 ? "" : "s"}
              </span>
              <PrintButton />
            </div>
          </div>

          {/* Receipts */}
          <ul className="space-y-3">
            {purchases.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p.courseTitle}</h3>
                      <Badge variant={statusVariant[p.status] ?? "secondary"}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(p.at)}
                      {p.provider && (
                        <>
                          {" · paid with "}
                          <span className="capitalize">{p.provider}</span>
                        </>
                      )}
                    </p>
                    {p.reference && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        Ref: {p.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(p.amount, p.currency)}
                    </p>
                    {p.courseSlug && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Link href={`/learn/${p.courseSlug}`}>
                          <PlayCircle className="size-4" /> Open course
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-center text-xs text-muted-foreground">
            Need a formal invoice? Use “Print receipts” and save as PDF.
          </p>
        </div>
      )}
    </div>
  );
}
