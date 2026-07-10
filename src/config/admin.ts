import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  Ticket,
  Receipt,
  LifeBuoy,
  ScrollText,
  Settings,
  Compass,
} from "lucide-react";

import type { DashboardNavGroup, DashboardNavItem } from "./dashboard";

/** Admin panel sidebar navigation. */
export const adminNav: DashboardNavGroup[] = [
  {
    heading: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    heading: "Manage",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Courses", href: "/admin/courses", icon: BookOpen },
      { title: "Categories", href: "/admin/categories", icon: FolderTree },
      { title: "Coupons", href: "/admin/coupons", icon: Ticket },
      { title: "Orders", href: "/admin/orders", icon: Receipt },
    ],
  },
  {
    heading: "Operations",
    items: [
      { title: "Support Tickets", href: "/admin/tickets", icon: LifeBuoy },
      { title: "Audit Logs", href: "/admin/audit", icon: ScrollText },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

/** Footer link back to the main site. */
export const adminFooterLink: DashboardNavItem = {
  title: "Back to Site",
  href: "/",
  icon: Compass,
};
