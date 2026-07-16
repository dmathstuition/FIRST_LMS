import {
  BarChart3,
  BrainCircuit,
  Code2,
  GraduationCap,
  Laptop,
  LineChart,
  Sigma,
  Sparkles,
} from "lucide-react";

const skills = [
  { icon: Sigma, label: "Mathematics" },
  { icon: Code2, label: "Coding for Kids" },
  { icon: BarChart3, label: "Data Analysis" },
  { icon: BrainCircuit, label: "Artificial Intelligence" },
  { icon: GraduationCap, label: "Tech in Teaching" },
  { icon: Laptop, label: "Web Development" },
  { icon: LineChart, label: "Problem Solving" },
  { icon: Sparkles, label: "AI Tools" },
];

/**
 * An infinite, auto-scrolling marquee of the topics D-MATHS teaches. The track
 * is duplicated back-to-back and translated -50%, so the loop is seamless.
 * Pauses on hover and respects reduced-motion (via the global rule that neuters
 * animation duration). Pure CSS animation — no JS, no layout thrash.
 */
export function SkillsMarquee() {
  return (
    <section className="border-y bg-muted/20 py-6">
      <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]">
          {[...skills, ...skills].map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur"
            >
              <s.icon className="size-4 text-primary" />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
