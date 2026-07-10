import type { Metadata } from "next";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { RegisterForm } from "@/features/auth/components/register-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join DMATHS Learning Hub and start learning today.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole = role === "instructor" ? "instructor" : "student";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start learning in minutes. No credit card required.
        </p>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <RegisterForm defaultRole={defaultRole} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
