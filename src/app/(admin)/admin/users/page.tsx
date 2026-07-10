import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getUsers } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";
import { UserRoleSelect } from "@/features/admin/components/user-role-select";

export const metadata: Metadata = { title: "Users · Admin" };

export default async function AdminUsersPage() {
  await requireRole(["admin"], "/admin");
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Users"
        description={`${users.length} registered users. Change a role to grant instructor or admin access.`}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">XP</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt="" />}
                      <AvatarFallback className="text-xs">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      {u.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {u.xp.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {new Date(u.joinedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <UserRoleSelect userId={u.id} role={u.role} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
