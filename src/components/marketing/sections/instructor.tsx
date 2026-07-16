import Image from "next/image";
import {
  BarChart3,
  BrainCircuit,
  Code2,
  GraduationCap,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

/**
 * "Meet the founder" spotlight — the visionary behind D-MATHS.
 *
 * The portrait is served from /public/founder.jpg. Drop your photo there (name
 * it exactly `founder.jpg`) and it appears automatically; until then the brand
 * gradient shows behind it.
 */
export function Instructor() {
  return (
    <section id="instructor" className="border-y bg-muted/30 py-20 sm:py-28">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            Meet the founder
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            The vision behind D-MATHS
          </h2>
          <p className="mt-2 font-medium text-muted-foreground">
            Educator • Web Developer, Data Analyst &amp; AI Engineer
          </p>

          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>
              Meet the visionary behind the D-MATHS Learning Portal — a
              passionate educator and technology professional dedicated to
              transforming education through innovation.
            </p>
            <p>
              As a Web Developer, Data Analyst, and AI Engineer, he combines
              expertise in software development, data-driven decision-making, and
              artificial intelligence to create educational solutions that are
              practical, engaging, and impactful — bridging the gap between
              traditional teaching methods and modern digital learning.
            </p>
            <p>
              Driven by the belief that every learner deserves access to
              high-quality education, he founded D-MATHS to give students an
              interactive platform to learn, practice, monitor their progress,
              and develop future-ready skills in mathematics, coding, artificial
              intelligence, and technology — empowering the next generation of
              problem-solvers and innovators across Africa and beyond.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Code2 className="size-3.5" /> Web Development
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <BarChart3 className="size-3.5" /> Data Analysis
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <BrainCircuit className="size-3.5" /> AI Engineering
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sigma className="size-3.5" /> Mathematics
            </Badge>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <Focus icon={Sigma} label="Mathematics" />
            <Focus icon={Code2} label="Coding for Kids" />
            <Focus icon={GraduationCap} label="Tech in Teaching" />
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2" y={32}>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-25 blur-3xl" />
            <div className="animated-gradient glow-ring overflow-hidden rounded-3xl border p-1.5">
              <Image
                src="/founder.jpg"
                alt="D-MATHS founder"
                width={800}
                height={1000}
                className="aspect-[4/5] w-full rounded-[1.35rem] object-cover"
                priority
              />
            </div>

            {/* Floating credential chip */}
            <div className="glass-strong absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 sm:-left-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <Sparkles className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Founder & Lead Educator</p>
                <p className="text-xs text-muted-foreground">
                  Web Dev · Data · AI
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Focus({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center text-sm font-medium shadow-sm transition-colors hover:border-primary/30">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      {label}
    </div>
  );
}
