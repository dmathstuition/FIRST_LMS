"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import {
  studentNav,
  browseCoursesLink,
  type DashboardNavItem,
} from "@/config/dashboard";
import { adminNav, adminFooterLink } from "@/config/admin";
import { cn } from "@/lib/utils";

export type DashboardVariant = "student" | "admin";

/**
 * Resolve nav + footer link for a variant.
 *
 * IMPORTANT: the nav configs contain lucide icon *components* (functions), which
 * are not serializable and therefore cannot be passed from a Server Component to
 * a Client Component as props. So this client component imports the configs
 * directly and selects by a serializable `variant` string.
 */
function resolveNav(variant: DashboardVariant) {
  switch (variant) {
    case "admin":
      return { nav: adminNav, footerLink: adminFooterLink };
    default:
      return { nav: studentNav, footerLink: browseCoursesLink };
  }
}

/** Determine whether a nav item is the active route. */
function isActive(pathname: string, item: DashboardNavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/**
 * Generic dashboard sidebar contents (nav groups + a highlighted footer link).
 * Rendered in the fixed desktop rail and inside the mobile drawer, for the
 * student and admin areas — selected by the `variant` prop.
 */
export function SidebarContent({
  variant,
  label,
  onNavigate,
}: {
  variant: DashboardVariant;
  /** Small badge under the brand, e.g. "Instructor". */
  label?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { nav, footerLink } = resolveNav(variant);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-5 font-semibold">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <Image
            src="/logo.png"
            alt={siteConfig.shortName}
            width={36}
            height={36}
            className="size-9 rounded-xl object-contain"
          />
          <span className="text-sm">{siteConfig.shortName}</span>
        </Link>
        {label && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            {label}
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin">
        {nav.map((group) => (
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

      {/* Footer link */}
      <div className="border-t p-3">
        <Link
          href={footerLink.href}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg bg-brand-gradient px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          <footerLink.icon className="size-[18px] shrink-0" />
          {footerLink.title}
        </Link>
      </div>
    </div>
  );
}
