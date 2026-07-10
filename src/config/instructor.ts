import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  Compass,
} from "lucide-react";

import type { DashboardNavGroup, DashboardNavItem } from "./dashboard";

/** Instructor panel sidebar navigation. */
export const instructorNav: DashboardNavGroup[] = [
  {
    heading: "Teach",
    items: [
      { title: "Overview", href: "/instructor", icon: LayoutDashboard, exact: true },
      { title: "My Courses", href: "/instructor/courses", icon: BookOpen },
      { title: "Students", href: "/instructor/students", icon: Users },
      { title: "Reviews", href: "/instructor/reviews", icon: Star },
      { title: "Messages", href: "/instructor/messages", icon: MessageSquare },
    ],
  },
  {
    heading: "Business",
    items: [
      { title: "Earnings", href: "/instructor/earnings", icon: DollarSign },
      { title: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    ],
  },
];

/** Footer link back to the learner experience. */
export const switchToLearningLink: DashboardNavItem = {
  title: "Switch to Learning",
  href: "/dashboard",
  icon: Compass,
};
