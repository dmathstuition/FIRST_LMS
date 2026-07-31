import { Reveal } from "@/components/motion/reveal";

export interface LegalSection {
  heading: string;
  body: string[];
}

/**
 * Shared layout for the static legal pages (Terms, Privacy, Refunds). Renders a
 * centered, readable column with a title, "last updated" line, and a series of
 * headed sections. Content is passed in per-page so each route stays a thin
 * Server Component.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-brand-radial"
      />
      <article className="container max-w-3xl py-16 sm:py-24">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {updated}
          </p>
          <p className="mt-6 text-lg text-muted-foreground">{intro}</p>
        </Reveal>

        <div className="mt-10 space-y-8">
          {sections.map((section, i) => (
            <Reveal key={section.heading} delay={i * 0.04}>
              <section>
                <h2 className="text-xl font-semibold tracking-tight">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                  {section.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          Questions about this policy? Contact us at{" "}
          <a
            href="mailto:hello@dmaths.io"
            className="font-medium text-primary hover:underline"
          >
            hello@dmaths.io
          </a>
          .
        </p>
      </article>
    </div>
  );
}
