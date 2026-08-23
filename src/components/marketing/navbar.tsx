"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, LayoutDashboard } from "lucide-react";

import { siteConfig, marketingNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Sticky, glassmorphic marketing navbar. Becomes opaque on scroll, adapts its
 * CTA to the auth state, and collapses into a dialog-based drawer on mobile.
 */
export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const { isAuthenticated, loading } = useUser();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass border-b shadow-sm"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        className="container flex h-16 items-center justify-between gap-4"
        aria-label="Main"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={36}
            height={36}
            className="size-9 rounded-xl object-contain"
            priority
          />
          <span className="hidden sm:inline">{siteConfig.name}</span>
          <span className="sm:hidden">{siteConfig.shortName}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!loading && isAuthenticated ? (
            <Button asChild variant="gradient" className="hidden sm:inline-flex">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gradient" className="hidden sm:inline-flex">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="left-auto right-0 top-0 h-dvh max-w-xs translate-x-0 translate-y-0 rounded-none rounded-l-2xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
              <DialogTitle className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt={siteConfig.shortName}
                  width={32}
                  height={32}
                  className="size-8 rounded-lg object-contain"
                />
                {siteConfig.shortName}
              </DialogTitle>
              <ul className="mt-4 flex flex-col gap-1">
                {marketingNav.map((item) => (
                  <li key={item.href}>
                    <DialogClose asChild>
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent/10"
                      >
                        {item.title}
                      </Link>
                    </DialogClose>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                {isAuthenticated ? (
                  <DialogClose asChild>
                    <Button asChild variant="gradient">
                      <Link href="/dashboard">Go to dashboard</Link>
                    </Button>
                  </DialogClose>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button asChild variant="outline">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button asChild variant="gradient">
                        <Link href="/register">Get started</Link>
                      </Button>
                    </DialogClose>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  );
}
