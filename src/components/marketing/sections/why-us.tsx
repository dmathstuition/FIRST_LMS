import {
  BrainCircuit,
  Award,
  Infinity as InfinityIcon,
  Users,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-powered learning",
    desc: "An AI tutor, quiz generator, and course assistant help you learn faster and never get stuck.",
  },
  {
    icon: Award,
    title: "Verifiable certificates",
    desc: "Earn shareable certificates with QR verification the moment you complete a course.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime access",
    desc: "Buy once, learn forever. Revisit lessons and get free updates for life.",
  },
  {
    icon: Users,
    title: "Learn with a community",
    desc: "Discussion forums, Q&A, and peer support on every lesson keep you motivated.",
  },
  {
    icon: Smartphone,
    title: "Learn anywhere",
    desc: "A responsive, Netflix-style player that works beautifully on any device.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    desc: "Bank-grade security, row-level data isolation, and privacy you can trust.",
  },
];

/** Value-proposition grid. */
export function WhyUs() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Why D-MATHS"
          title="Everything you need to actually learn"
          subtitle="Not just videos — a complete, thoughtfully designed learning experience."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
