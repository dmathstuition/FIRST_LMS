import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { integrations } from "@/lib/env";
import {
  getAdminProgramById,
  getProgramRegistrations,
} from "@/features/programs/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramForm } from "@/features/programs/components/program-form";

export const metadata: Metadata = { title: "Edit program · Admin" };

type Params = { params: Promise<{ id: string }> };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EditProgramPage({ params }: Params) {
  await requireRole(["admin"], "/admin");
  const { id } = await params;
  const [program, registrations] = await Promise.all([
    getAdminProgramById(id),
    getProgramRegistrations(id),
  ]);
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Program" description="Update this cohort's details.">
        {program.status === "published" && (
          <Button asChild variant="outline">
            <Link href={`/programs/${program.slug}`} target="_blank">
              View live <ExternalLink className="size-4" />
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <ProgramForm
                programId={program.id}
                storageEnabled={integrations.supabase}
                defaults={{
                  title: program.title,
                  slug: program.slug,
                  subtitle: program.subtitle ?? "",
                  description: program.description ?? "",
                  coverUrl: program.coverUrl ?? "",
                  format: program.format,
                  location: program.location ?? "",
                  price: program.price,
                  discountPrice: program.discountPrice,
                  capacity: program.capacity,
                  startDate: program.startDate,
                  endDate: program.endDate,
                  enrollmentDeadline: program.enrollmentDeadline,
                  published: program.status === "published",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Registrations */}
        <div>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" /> Registrations
              </CardTitle>
              <Badge variant="secondary">{registrations.length}</Badge>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No registrations yet. Published programs collect reservations
                  here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {registrations.map((r) => (
                    <li key={r.id} className="text-sm">
                      <p className="font-medium">{r.name}</p>
                      <p className="truncate text-xs text-muted-foreground" title={r.email}>
                        {r.email}
                      </p>
                      {r.note && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          “{r.note}”
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
