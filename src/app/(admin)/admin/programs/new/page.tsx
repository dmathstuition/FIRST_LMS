import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramForm } from "@/features/programs/components/program-form";

export const metadata: Metadata = { title: "New program · Admin" };

export default async function NewProgramPage() {
  await requireRole(["admin"], "/admin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New Program"
        description="Set up a cohort. It stays private until you publish it."
      />
      <Card>
        <CardContent className="pt-6">
          <ProgramForm storageEnabled={integrations.supabase} />
        </CardContent>
      </Card>
    </div>
  );
}
