import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck, Calendar, User, BookOpen } from "lucide-react";

import { verifyCertificate } from "@/features/certificates/queries";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Certificate Verification",
  robots: { index: false }, // per-certificate pages shouldn't be indexed
};

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await verifyCertificate(decodeURIComponent(token));

  return (
    <div className="container flex flex-col items-center py-20">
      <div className="w-full max-w-lg">
        {result ? (
          <div className="overflow-hidden rounded-3xl border shadow-lg">
            <div className="relative bg-brand-900 p-8 text-center text-white">
              <div className="animated-gradient absolute inset-0 opacity-90" />
              <div className="relative z-10">
                <CheckCircle2 className="mx-auto size-14" />
                <h1 className="mt-4 text-2xl font-bold">Certificate verified</h1>
                <p className="mt-1 text-sm text-white/80">
                  This certificate was authentically issued by {siteConfig.name}.
                </p>
              </div>
            </div>

            <dl className="space-y-4 bg-card p-8">
              <Row icon={User} label="Awarded to" value={result.studentName} />
              <Row icon={BookOpen} label="Course" value={result.courseTitle} />
              <Row
                icon={ShieldCheck}
                label="Certificate No."
                value={result.certificateNumber}
                mono
              />
              <Row
                icon={Calendar}
                label="Issued"
                value={new Date(result.issuedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </dl>
          </div>
        ) : (
          <div className="rounded-3xl border p-10 text-center shadow-sm">
            <XCircle className="mx-auto size-14 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold">Certificate not found</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t verify a certificate with the code{" "}
              <code className="font-mono text-foreground">{token}</code>. Please
              double-check the code and try again.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/verify">Verify another certificate</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={mono ? "font-mono font-medium" : "font-medium"}>
          {value}
        </dd>
      </div>
    </div>
  );
}
