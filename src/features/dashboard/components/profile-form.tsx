"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { updateProfile, type ProfileFormState } from "../actions";

export interface ProfileDefaults {
  fullName: string;
  headline: string;
  bio: string;
  country: string;
  website: string;
  email: string;
}

/** Profile settings form (name, headline, bio, country, website). */
export function ProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={defaults.email} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          Email is managed by your sign-in method and can&apos;t be changed here.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaults.fullName}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          defaultValue={defaults.headline}
          placeholder="e.g. Aspiring data scientist"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={defaults.bio}
          rows={4}
          placeholder="Tell us a little about yourself…"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={defaults.country}
            placeholder="e.g. Ghana"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={defaults.website}
            placeholder="https://…"
          />
        </div>
      </div>

      <SubmitButton variant="gradient" pendingText="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
