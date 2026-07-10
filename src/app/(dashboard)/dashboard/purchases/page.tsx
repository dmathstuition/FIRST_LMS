import type { Metadata } from "next";
import { Receipt } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Purchases" };

export default async function PurchasesPage() {
  // Order history + invoices render here once checkout is live (Phase 9). The
  // `orders`, `payments`, and `invoices` tables already exist in the schema.
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Purchases"
        description="Your order history, receipts, and invoices."
      />
      <EmptyState
        icon={Receipt}
        title="No purchases yet"
        description="When you buy a course your receipts and downloadable invoices will appear here."
        actionLabel="Browse courses"
        actionHref="/courses"
      />
    </div>
  );
}
