import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getCoupons } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CouponForm } from "@/features/admin/components/coupon-form";

export const metadata: Metadata = { title: "Coupons · Admin" };

export default async function AdminCouponsPage() {
  await requireRole(["admin"], "/admin");
  const coupons = await getCoupons();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Coupons"
        description="Create and manage discount codes."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponForm />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="hidden sm:table-cell">Redemptions</TableHead>
              <TableHead className="hidden md:table-cell">Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => {
              const expired =
                c.expiresAt != null && new Date(c.expiresAt) < new Date();
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell>
                    {c.discountType === "percent"
                      ? `${c.amount}%`
                      : `$${c.amount}`}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {c.redemptions.toLocaleString()}
                    {c.maxRedemptions ? ` / ${c.maxRedemptions.toLocaleString()}` : ""}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.active && !expired ? "success" : "secondary"}
                    >
                      {!c.active ? "Inactive" : expired ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
