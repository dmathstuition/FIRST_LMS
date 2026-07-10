import Image from "next/image";
import { Star, Users, BookOpen, Award } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

/** "Meet the Instructor" spotlight (mirrors the seeded demo instructor). */
export function Instructor() {
  return (
    <section id="instructor" className="border-y bg-muted/30 py-20 sm:py-28">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Meet your instructor
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Dr. Ada Mensah
          </h2>
          <p className="mt-2 font-medium text-muted-foreground">
            Mathematician &amp; Software Engineer • 12+ years teaching
          </p>
          <p className="mt-5 text-muted-foreground">
            Ada has helped over 40,000 students master mathematics and
            programming through clear, first-principles teaching. A former
            university lecturer and lead engineer, she believes anyone can learn
            anything with the right explanation.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary">Mathematics</Badge>
            <Badge variant="secondary">Data Science</Badge>
            <Badge variant="secondary">Web Development</Badge>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat icon={Users} value="40K+" label="Students" />
            <Stat icon={BookOpen} value="12" label="Courses" />
            <Stat icon={Star} value="4.9" label="Rating" />
            <Stat icon={Award} value="98%" label="Completion" />
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2" y={32}>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-brand-gradient opacity-20 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=900&fit=crop&crop=faces"
                alt="Dr. Ada Mensah"
                width={800}
                height={900}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
      <Icon className="mx-auto size-5 text-primary" />
      <p className="mt-1.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
