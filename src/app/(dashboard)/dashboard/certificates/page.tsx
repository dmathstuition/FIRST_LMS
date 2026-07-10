import type { Metadata } from "next";
import Link from "next/link";
import { Award, ShieldCheck, ExternalLink, Download } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getCertificates } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await getCertificates(user.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Certificates"
        description="Your verified certificates of completion."
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn a verifiable certificate you can share."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              {/* Certificate visual */}
              <div className="relative border-b bg-brand-900 p-6 text-white">
                <div className="animated-gradient absolute inset-0 opacity-90" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                      <Award className="size-6" />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-white/70">
                      Certificate
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-white/70">This certifies that</p>
                  <p className="text-lg font-semibold">
                    {user.fullName ?? "Learner"}
                  </p>
                  <p className="mt-2 text-xs text-white/70">
                    successfully completed
                  </p>
                  <p className="font-medium">{cert.courseTitle}</p>
                </div>
              </div>

              {/* Meta + actions */}
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{cert.certificateNumber}</span>
                  <span>
                    {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/verify/${cert.verificationToken}`}>
                      <ShieldCheck className="size-4" /> Verify
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <a
                      href={`${siteConfig.url}/verify/${cert.verificationToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" /> Public link
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" disabled title="PDF export coming soon">
                    <Download className="size-4" /> PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
