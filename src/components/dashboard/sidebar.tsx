"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { siteConfig } from "@/config/site";
import {
  studentNav,
  browseCoursesLink,
  type DashboardNavItem,
} from "@/config/dashboard";
import { cn } from "@/lib/utils";

/** Determine whether a nav item is the active route. */
function isActive(pathname: string, item: DashboardNavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/**
 * Dashboard sidebar contents (nav groups + browse link). Rendered both in the
 * fixed desktop rail and inside the mobile drawer, so it takes no layout props.
 */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-5 font-semibold">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={onNavigate}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-sm">{siteConfig.shortName}</span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin">
        {studentNav.map((group) => (
          <div key={group.heading}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.heading}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-[18px] shrink-0" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: browse courses */}
      <div className="border-t p-3">
        <Link
          href={browseCoursesLink.href}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg bg-brand-gradient px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          <browseCoursesLink.icon className="size-[18px] shrink-0" />
          {browseCoursesLink.title}
        </Link>
      </div>
    </div>
  );
}
