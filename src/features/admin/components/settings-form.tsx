"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { updateSiteSettings, type ActionState } from "../actions";
import type { SiteSettings } from "../types";

const featureToggles = [
  { key: "affiliates", label: "Affiliate program", desc: "Let users earn commissions with referral codes." },
  { key: "gamification", label: "Gamification", desc: "XP, badges, streaks, and leaderboards." },
  { key: "blog", label: "Blog", desc: "Publish articles and learning resources." },
] as const;

/** Site settings form (branding, SEO, feature flags). */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateSiteSettings,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-8">
      {state && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </div>
      )}

      {/* Branding */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Branding
        </h2>
        <div className="space-y-2">
          <Label htmlFor="siteName">Site name</Label>
          <Input id="siteName" name="siteName" defaultValue={settings.siteName} required />
        </div>
        <div className="flex gap-6">
          <div className="space-y-2">
            <Label>Primary color</Label>
            <div className="flex items-center gap-2">
              <span
                className="size-8 rounded-lg border"
                style={{ background: settings.primaryColor }}
              />
              <code className="text-sm text-muted-foreground">
                {settings.primaryColor}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent color</Label>
            <div className="flex items-center gap-2">
              <span
                className="size-8 rounded-lg border"
                style={{ background: settings.accentColor }}
              />
              <code className="text-sm text-muted-foreground">
                {settings.accentColor}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          SEO
        </h2>
        <div className="space-y-2">
          <Label htmlFor="seoTitle">Meta title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={settings.seoTitle} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">Meta description</Label>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={settings.seoDescription}
            rows={3}
          />
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Features
        </h2>
        <div className="divide-y rounded-xl border">
          {featureToggles.map((f) => (
            <label
              key={f.key}
              className="flex cursor-pointer items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              <input
                type="checkbox"
                name={f.key}
                defaultChecked={settings.features[f.key]}
                className="size-5 accent-[hsl(var(--primary))]"
              />
            </label>
          ))}
        </div>
      </section>

      <SubmitButton variant="gradient" pendingText="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
