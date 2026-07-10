import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  SettingsTabs,
} from "@/features/dashboard/components/settings-tabs";
import type { ProfileDefaults } from "@/features/dashboard/components/profile-form";

export const metadata: Metadata = { title: "Settings" };

/** Load the user's extended profile to prefill the settings forms. */
async function loadProfileDefaults(
  userId: string,
  email: string,
  fullName: string | null,
): Promise<ProfileDefaults> {
  const base: ProfileDefaults = {
    fullName: fullName ?? "",
    headline: "",
    bio: "",
    country: "",
    website: "",
    email,
  };

  if (!integrations.supabase) return base;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, country, website")
      .eq("id", userId)
      .single();

    const p = data as {
      full_name: string | null;
      headline: string | null;
      bio: string | null;
      country: string | null;
      website: string | null;
    } | null;

    if (!p) return base;
    return {
      fullName: p.full_name ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      country: p.country ?? "",
      website: p.website ?? "",
      email,
    };
  } catch {
    return base;
  }
}

export default async function SettingsPage() {
  const user = await requireUser();
  const defaults = await loadProfileDefaults(
    user.id,
    user.email ?? "",
    user.fullName,
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and preferences."
      />
      <SettingsTabs defaults={defaults} />
    </div>
  );
}
