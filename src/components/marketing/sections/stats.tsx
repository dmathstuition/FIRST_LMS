import { BookOpen, Globe, Star, Users } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";

const stats = [
  { value: "100K+", label: "Active learners", icon: Users },
  { value: "500+", label: "Expert courses", icon: BookOpen },
  { value: "4.9/5", label: "Average rating", icon: Star },
  { value: "50+", label: "Countries reached", icon: Globe },
];

/** Headline statistics band directly under the hero — premium glass tiles. */
export function Stats() {
  return (
    <section className="border-b bg-muted/20">
      <div className="container grid grid-cols-2 gap-4 py-12 sm:grid-cols-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="glass flex items-center gap-4 rounded-2xl px-4 py-4 shadow-sm">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-gradient-warm sm:text-3xl">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
