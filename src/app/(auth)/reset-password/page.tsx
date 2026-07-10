import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your DMATHS account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
