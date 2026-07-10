import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/features/dashboard/queries";
import { SidebarContent } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

/**
 * Instructor panel shell. Access is restricted to instructor + admin roles
 * (enforced here and in middleware). Reuses the dashboard sidebar/topbar with
 * the instructor navigation.
 */
export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["instructor", "admin"], "/instructor");
  const notifications = await getNotifications(user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r bg-card/40 lg:block">
        <SidebarContent variant="instructor" label="Instructor" />
      </aside>

      <div className="flex min-h-dvh flex-col">
        <Topbar
          user={user}
          unreadCount={unread}
          variant="instructor"
          sidebarLabel="Instructor"
          searchPlaceholder="Search students, courses…"
        />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
