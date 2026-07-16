"use client";

import { m } from "framer-motion";
import {
  Award,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Logo } from "@/components/logo";

/**
 * A pure-CSS, floating product mockup of the D-MATHS course player, used as the
 * hero centerpiece. No screenshots or images — everything is composed from
 * styled elements so it stays crisp at any size, renders instantly (no network),
 * and adapts to light/dark themes. Framer Motion (`m`) drives a gentle float and
 * the surrounding trust chips.
 */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* Ambient glow behind the frame */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-3xl"
      />

      <m.div
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong glow-ring animate-float-slow overflow-hidden rounded-2xl"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3 dark:border-white/10">
          <span className="size-3 rounded-full bg-red-400/80" />
          <span className="size-3 rounded-full bg-amber-400/80" />
          <span className="size-3 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex items-center gap-1.5 rounded-md bg-black/5 px-2.5 py-1 text-[11px] text-muted-foreground dark:bg-white/10">
            <Logo className="size-3.5 text-primary" strokeWidth={6} />
            learn.d-maths.com
          </div>
        </div>

        {/* Player body */}
        <div className="p-4">
          {/* Video stage */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-700">
            <div className="grain absolute inset-0 opacity-[0.15]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <m.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex size-14 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-lg backdrop-blur"
              >
                <PlayCircle className="size-8" />
              </m.div>
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              Lesson 4 · Derivatives
            </span>
            {/* Fake scrub bar */}
            <div className="absolute inset-x-3 bottom-3">
              <div className="h-1 w-full rounded-full bg-white/25">
                <div className="h-1 w-2/3 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Title + progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Mathematics Made Simple</p>
              <span className="text-xs font-medium text-primary">62%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 w-[62%] rounded-full bg-brand-gradient" />
            </div>
          </div>

          {/* Lesson list */}
          <ul className="mt-4 space-y-2">
            {[
              { t: "What is a limit? (intuition first)", done: true },
              { t: "The derivative as a rate of change", done: true },
              { t: "Differentiation rules", done: false, active: true },
            ].map((l) => (
              <li
                key={l.t}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                  l.active
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <PlayCircle className="size-4 shrink-0 text-primary" />
                )}
                <span className="truncate">{l.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </m.div>

      {/* Floating trust chips */}
      <m.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="glass-strong absolute -left-4 top-24 hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
          <Award className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">Certificate</p>
          <p className="text-[10px] text-muted-foreground">Earned on finish</p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="glass-strong absolute -right-4 bottom-16 hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
          <TrendingUp className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">+18% this week</p>
          <p className="text-[10px] text-muted-foreground">Learning streak</p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.5 }}
        className="glass-strong absolute -right-2 top-6 hidden items-center gap-1.5 rounded-full px-3 py-1.5 md:flex"
      >
        <Sparkles className="size-3.5 text-accent" />
        <span className="text-[11px] font-medium">AI study assistant</span>
      </m.div>
    </div>
  );
}
