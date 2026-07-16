import Link from "next/link";
import {
  Sigma,
  Code,
  BarChart3,
  Palette,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  Laptop,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import { getCategories } from "@/features/courses/queries";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";

// Map the icon name stored on each category to a concrete lucide icon.
const iconMap: Record<string, LucideIcon> = {
  Sigma,
  Code,
  BarChart3,
  Palette,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  Laptop,
};

/** Browse-by-category grid. Server component. */
export async function Categories() {
  const categories = await getCategories();

  return (
    <section id="categories" className="border-y bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Explore"
          title="Learn anything, one category at a time"
          subtitle="From pure mathematics to modern web development — find your path."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => {
            const Icon = iconMap[category.icon ?? ""] ?? BookOpen;
            return (
              <Reveal key={category.id} delay={i * 0.05}>
                <Link
                  href={`/courses?category=${category.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm transition-transform group-hover:scale-105">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    {typeof category.courseCount === "number" && (
                      <p className="mt-2 text-xs font-medium text-primary">
                        {category.courseCount} course
                        {category.courseCount === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
