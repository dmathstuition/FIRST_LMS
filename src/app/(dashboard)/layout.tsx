import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/features/dashboard/queries";
import { SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

/**
 * Authenticated dashboard shell: fixed sidebar rail on desktop, a sticky top
 * bar, and the routed content. Auth is enforced here (and in middleware) so
 * every nested page can assume a signed-in user.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar rail */}
      <aside className="sticky top-0 hidden h-dvh border-r bg-card/40 lg:block">
        <SidebarContent variant="student" />
      </aside>

      {/* Main column */}
      <div className="flex min-h-dvh flex-col">
        <Topbar user={user} unreadCount={unread} variant="student" />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
