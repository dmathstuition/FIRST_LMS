import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getSiteSettings } from "@/features/admin/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/features/admin/components/settings-form";

export const metadata: Metadata = { title: "Site Settings · Admin" };

export default async function AdminSettingsPage() {
  await requireRole(["admin"], "/admin");
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Site Settings"
        description="Configure branding, SEO, and platform features."
      />
      <Card>
        <CardContent className="pt-6">
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
