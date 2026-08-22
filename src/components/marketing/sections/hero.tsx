"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, PlayCircle, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { HeroPreview } from "@/components/marketing/hero-preview";

/**
 * Hero section — a premium two-column layout: a staggered value proposition on
 * the left and a floating course-player product mockup on the right. The
 * background layers an aurora glow, a subtle grid, animated color blobs, and a
 * fine film-grain for depth. Pure client component for the entrance animation;
 * copy is static and instantly LCP-friendly.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-brand-radial" />
        <m.div
          className="absolute -left-24 top-10 size-72 rounded-full bg-primary/30 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          className="absolute -right-24 top-40 size-80 rounded-full bg-accent/25 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          className="absolute left-1/3 top-1/2 size-64 rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ y: [0, 24, 0], x: [0, -16, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid, masked to fade at the edges */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        {/* Film grain */}
        <div className="grain absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" />
      </div>

      <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-8 lg:py-28">
        {/* Left: value proposition */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
              <Logo className="size-4 text-primary" strokeWidth={6} />
              Founder-led courses in maths, code &amp; AI
            </span>
          </m.div>

          <m.h1
            className="mt-6 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Learn the <span className="marker">skills</span> schools skip —
            taught properly.
          </m.h1>

          <m.p
            className="mt-6 max-w-xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            D-MATHS is a founder-led learning studio for mathematics, coding for
            kids, data and AI. Real understanding over rote memorisation — built
            for learners across Africa and beyond.
          </m.p>

          <m.div
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild size="lg" variant="gradient" className="min-w-48">
              <Link href="/register">
                Start learning free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-48">
              <Link href="/courses">
                <PlayCircle className="size-4" /> Explore courses
              </Link>
            </Button>
          </m.div>

          <m.div
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  { i: "KO", c: "bg-primary/15 text-primary" },
                  { i: "AN", c: "bg-accent/15 text-accent" },
                  { i: "DP", c: "bg-emerald-500/15 text-emerald-600" },
                  { i: "ZA", c: "bg-indigo-500/15 text-indigo-600" },
                ].map((a) => (
                  <span
                    key={a.i}
                    className={`flex size-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold ${a.c}`}
                  >
                    {a.i}
                  </span>
                ))}
              </div>
              <span>Learners in 50+ countries</span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </span>
              <strong className="text-foreground">4.9</strong> average rating
            </span>
          </m.div>
        </div>

        {/* Right: floating product mockup */}
        <div className="[perspective:1200px]">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
