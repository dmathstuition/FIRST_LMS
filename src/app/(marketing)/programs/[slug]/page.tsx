import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Monitor,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getProgramBySlug } from "@/features/programs/queries";
import { ProgramRegisterForm } from "@/features/programs/components/program-register-form";
import { getSessionUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program not found" };
  return {
    title: program.title,
    description: program.subtitle ?? undefined,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      title: program.title,
      description: program.subtitle ?? undefined,
      images: program.coverUrl ? [program.coverUrl] : undefined,
    },
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProgramDetailPage({ params }: Params) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const user = await getSessionUser();
  const price = program.discountPrice ?? program.price;
  const hasDiscount =
    program.discountPrice != null && program.discountPrice < program.price;
  const start = formatDate(program.startDate);
  const end = formatDate(program.endDate);
  const deadline = formatDate(program.enrollmentDeadline);
  const paragraphs = (program.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="container py-12 sm:py-16">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All programs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <Badge variant="accent">{program.format}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {program.title}
          </h1>
          {program.subtitle && (
            <p className="mt-3 text-lg text-muted-foreground">{program.subtitle}</p>
          )}

          {program.coverUrl && (
            <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl border bg-muted">
              <Image
                src={program.coverUrl}
                alt={program.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-8 space-y-5 leading-relaxed text-foreground/90">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">
                Full program details are coming soon.
              </p>
            )}
          </div>
        </div>

        {/* Sticky register card */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-5 rounded-2xl border bg-card p-6 shadow-lg">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">
                {price > 0 ? formatCurrency(price, program.currency) : "Free"}
              </span>
              {hasDiscount && (
                <span className="mb-1 text-muted-foreground line-through">
                  {formatCurrency(program.price, program.currency)}
                </span>
              )}
            </div>

            <ul className="space-y-2.5 text-sm">
              {start && (
                <li className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Starts {start}
                  {end ? ` · ends ${end}` : ""}
                </li>
              )}
              {deadline && (
                <li className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  Enrol by {deadline}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Monitor className="size-4 text-muted-foreground" />
                {program.format}
              </li>
              {program.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  {program.location}
                </li>
              )}
              {program.capacity != null && (
                <li className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  Limited to {program.capacity} seats
                </li>
              )}
            </ul>

            <div className="border-t pt-5">
              <ProgramRegisterForm
                programId={program.id}
                programSlug={program.slug}
                defaultName={user?.fullName ?? undefined}
                defaultEmail={user?.email ?? undefined}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
