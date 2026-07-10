import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to activate your account.",
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-white">
        <MailCheck className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to your email. Click it to activate
          your account and start learning.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Didn&apos;t get it? Check your spam folder, or wait a minute and try again.
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
