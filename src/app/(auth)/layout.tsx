import Link from "next/link";
import { Quote } from "lucide-react";

import { Logo } from "@/components/logo";

import { siteConfig } from "@/config/site";

/**
 * Split-screen auth layout: a premium branded panel on the left (desktop) and
 * the form on the right. Fully responsive — the panel collapses on mobile.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="animated-gradient absolute inset-0 opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_45%)]" />

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2 text-lg font-semibold"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Logo className="size-5" />
          </span>
          {siteConfig.shortName}
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <Quote className="size-10 opacity-60" />
          <p className="text-2xl font-medium leading-snug">
            “D-MATHS didn&apos;t just teach me formulas — it gave me the intuition
            to actually understand. I finally get math.”
          </p>
          <div>
            <p className="font-semibold">Kwame Osei</p>
            <p className="text-sm text-white/70">Engineering Student</p>
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/70">
          Join 100,000+ learners mastering real skills.
        </p>
      </div>

      {/* Form area */}
      <main
        id="main"
        className="flex items-center justify-center px-6 py-12 sm:px-12"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-lg font-semibold lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Logo className="size-5" />
            </span>
            {siteConfig.shortName}
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
