"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Hero section with an animated aurora/gradient background, staggered headline
 * reveal, and floating stat chips. Pure client component for the entrance
 * animation; content is static and instantly LCP-friendly.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-brand-radial" />
        <m.div
          className="absolute -left-24 top-10 size-72 rounded-full bg-primary/30 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          className="absolute -right-24 top-40 size-80 rounded-full bg-accent/30 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <div className="container flex flex-col items-center py-24 text-center sm:py-32">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
            <Sparkles className="size-4 text-accent" />
            Learn smarter with AI-powered courses
          </span>
        </m.div>

        <m.h1
          className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Master real skills with{" "}
          <span className="text-gradient">premium, expert-led</span> courses
        </m.h1>

        <m.p
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          DMATHS Learning Hub is where ambitious learners go to truly understand
          mathematics, coding, and the skills that shape careers — beautifully
          taught, at your pace.
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
          className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <div className="flex -space-x-2">
            {[
              "from-blue-500 to-cyan-500",
              "from-violet-500 to-purple-500",
              "from-amber-500 to-orange-500",
              "from-emerald-500 to-teal-500",
            ].map((g, i) => (
              <span
                key={i}
                className={`size-8 rounded-full border-2 border-background bg-gradient-to-br ${g}`}
              />
            ))}
          </div>
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <strong className="text-foreground">4.9/5</strong> from 100,000+
            learners
          </span>
        </m.div>
      </div>
    </section>
  );
}
