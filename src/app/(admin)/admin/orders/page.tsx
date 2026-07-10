import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getOrders } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders · Admin" };

const statusVariant = {
  paid: "success",
  pending: "warning",
  failed: "secondary",
  refunded: "secondary",
} as const;

export default async function AdminOrdersPage() {
  await requireRole(["admin"], "/admin");
  const orders = await getOrders();

  const total = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Orders"
        description={`${orders.length} orders · ${formatCurrency(total)} collected (paid).`}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{o.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium">{o.userName}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {o.itemCount}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[o.status]} className="capitalize">
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(o.total, o.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
