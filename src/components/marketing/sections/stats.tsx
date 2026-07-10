import { Reveal } from "@/components/motion/reveal";

const stats = [
  { value: "100K+", label: "Active learners" },
  { value: "500+", label: "Expert courses" },
  { value: "4.9/5", label: "Average rating" },
  { value: "50+", label: "Countries reached" },
];

/** Headline statistics band directly under the hero. */
export function Stats() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container grid grid-cols-2 gap-6 py-12 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="text-center">
            <p className="text-3xl font-bold text-gradient sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
