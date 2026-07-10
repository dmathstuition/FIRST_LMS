import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/features/dashboard/queries";
import { SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

/**
 * Admin panel shell — restricted to the admin role (enforced here and in
 * middleware). Reuses the dashboard sidebar/topbar with the admin navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["admin"], "/admin");
  const notifications = await getNotifications(user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r bg-card/40 lg:block">
        <SidebarContent variant="admin" label="Admin" />
      </aside>

      <div className="flex min-h-dvh flex-col">
        <Topbar
          user={user}
          unreadCount={unread}
          variant="admin"
          sidebarLabel="Admin"
          searchPlaceholder="Search users, courses, orders…"
        />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
