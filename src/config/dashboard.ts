import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Award,
  Trophy,
  StickyNote,
  Bell,
  Receipt,
  Settings,
  Compass,
} from "lucide-react";

/** A single sidebar navigation entry. */
export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Exact match required for active state (used for the index route). */
  exact?: boolean;
}

/** Student dashboard sidebar navigation, grouped into sections. */
export const studentNav: { heading: string; items: DashboardNavItem[] }[] = [
  {
    heading: "Learn",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
      { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
      { title: "Certificates", href: "/dashboard/certificates", icon: Award },
      { title: "Achievements", href: "/dashboard/achievements", icon: Trophy },
      { title: "Notes & Bookmarks", href: "/dashboard/notes", icon: StickyNote },
    ],
  },
  {
    heading: "Account",
    items: [
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "Purchases", href: "/dashboard/purchases", icon: Receipt },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

/** Quick link surfaced in the sidebar footer. */
export const browseCoursesLink: DashboardNavItem = {
  title: "Browse Courses",
  href: "/courses",
  icon: Compass,
};
