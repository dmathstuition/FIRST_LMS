import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getPublishedPrograms } from "@/features/programs/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programs & Cohorts",
  description:
    "Live, cohort-based online programs from D-MATHS — hands-on, scheduled, and led personally.",
  alternates: { canonical: "/programs" },
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProgramsPage() {
  const programs = await getPublishedPrograms();

  return (
    <div className="container py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Live programs &amp; cohorts
        </h1>
        <p className="mt-3 text-muted-foreground">
          Scheduled, hands-on online programs led personally by D-MATHS — learn
          with a group, on a timeline, with real accountability.
        </p>
      </header>

      {programs.length === 0 ? (
        <div className="mx-auto mt-12 max-w-xl">
          <EmptyState
            icon={Rocket}
            title="No programs scheduled yet"
            description="New cohorts are being planned. Subscribe below or check back soon to reserve your spot."
            actionLabel="Browse courses"
            actionHref="/courses"
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => {
            const price = program.discountPrice ?? program.price;
            const start = formatDate(program.startDate);
            return (
              <Reveal key={program.slug} delay={i * 0.06}>
                <Link
                  href={`/programs/${program.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {program.coverUrl ? (
                      <Image
                        src={program.coverUrl}
                        alt={program.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-gradient/10 text-primary">
                        <Rocket className="size-10" />
                      </div>
                    )}
                    <Badge className="absolute left-3 top-3" variant="accent">
                      {program.format}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
                      {program.title}
                    </h2>
                    {program.subtitle && (
                      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {program.subtitle}
                      </p>
                    )}
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      {start && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="size-4" /> Starts {start}
                        </p>
                      )}
                      {program.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="size-4" /> {program.location}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-semibold">
                        {price > 0
                          ? formatCurrency(price, program.currency)
                          : "Free"}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
