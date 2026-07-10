"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { updatePassword, type AuthActionResult } from "@/features/auth/actions";
import { AuthError } from "@/features/auth/components/auth-error";
import { cn } from "@/lib/utils";
import { ProfileForm, type ProfileDefaults } from "./profile-form";

/** Settings surface: Profile · Password · Notifications · Appearance. */
export function SettingsTabs({ defaults }: { defaults: ProfileDefaults }) {
  return (
    <Tabs defaultValue="profile" className="max-w-3xl">
      <TabsList className="flex-wrap">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm defaults={defaults} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPrefs />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------- Password --------------------------------- */

function PasswordForm() {
  const [state, formAction] = React.useActionState<AuthActionResult, FormData>(
    updatePassword,
    undefined,
  );
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <AuthError error={state?.error} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <SubmitButton variant="gradient" pendingText="Updating…">
        Update password
      </SubmitButton>
    </form>
  );
}

/* ----------------------------- Notifications ------------------------------ */

const notificationOptions = [
  { key: "course_updates", label: "Course updates", desc: "New lessons and announcements in your courses." },
  { key: "achievements", label: "Achievements", desc: "Badges, streaks, and level-ups." },
  { key: "promotions", label: "Promotions", desc: "Discounts and new course launches." },
  { key: "email_digest", label: "Weekly email digest", desc: "A summary of your progress each week." },
] as const;

function NotificationPrefs() {
  // Preferences persist to a settings table in a later phase; the toggles are
  // fully interactive here so the UX is complete.
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
    course_updates: true,
    achievements: true,
    promotions: false,
    email_digest: true,
  });

  return (
    <div className="max-w-lg divide-y">
      {notificationOptions.map((opt) => (
        <div key={opt.key} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.desc}</p>
          </div>
          <Toggle
            checked={prefs[opt.key]}
            onChange={(v) => setPrefs((p) => ({ ...p, [opt.key]: v }))}
            label={opt.label}
          />
        </div>
      ))}
    </div>
  );
}

/** Accessible on/off toggle (no external dependency). */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ------------------------------ Appearance -------------------------------- */

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Choose how D-MATHS looks to you. Select a theme or sync with your system.
      </p>
      <div className="grid max-w-md grid-cols-3 gap-3">
        {options.map((opt) => {
          const active = mounted && theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-pressed={active}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all",
                active
                  ? "border-primary ring-1 ring-primary"
                  : "hover:border-primary/40",
              )}
            >
              {active && (
                <Check className="absolute right-2 top-2 size-4 text-primary" />
              )}
              <opt.icon className="size-6" />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
