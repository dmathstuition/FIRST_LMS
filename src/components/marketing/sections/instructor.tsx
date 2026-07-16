import Image from "next/image";
import { Code2, BarChart3, BrainCircuit, Sigma } from "lucide-react";

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
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Meet the founder
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
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
            <Focus label="Mathematics" />
            <Focus label="Coding for Kids" />
            <Focus label="Tech in Teaching" />
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2" y={32}>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-brand-gradient opacity-20 blur-2xl" />
            <div className="animated-gradient overflow-hidden rounded-3xl border shadow-xl">
              <Image
                src="/founder.jpg"
                alt="D-MATHS founder"
                width={800}
                height={1000}
                className="aspect-[4/5] w-full object-cover"
                priority
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Focus({ label }: { label: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center text-sm font-medium shadow-sm">
      {label}
    </div>
  );
}
