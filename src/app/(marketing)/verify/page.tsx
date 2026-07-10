import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, QrCode } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = {
  title: "Verify a Certificate",
  description:
    "Publicly verify the authenticity of a DMATHS Learning Hub certificate.",
  alternates: { canonical: "/verify" },
};

/** Certificate verification entry point. Submitting redirects to /verify/[token]. */
export default function VerifyPage() {
  async function goToToken(formData: FormData) {
    "use server";
    const token = String(formData.get("token") ?? "").trim();
    if (token) redirect(`/verify/${encodeURIComponent(token)}`);
  }

  return (
    <div className="container flex flex-col items-center py-20">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-white">
          <ShieldCheck className="size-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Verify a certificate
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter a certificate&apos;s verification code (or scan its QR code) to
          confirm it was genuinely issued by DMATHS Learning Hub.
        </p>

        <form
          action={goToToken}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            name="token"
            required
            placeholder="Verification code"
            aria-label="Certificate verification code"
            className="h-12 flex-1"
          />
          <SubmitButton size="lg" variant="gradient" className="h-12">
            <QrCode className="size-4" /> Verify
          </SubmitButton>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: try the code <code className="font-mono">demo</code> to see a
          sample verification.
        </p>
      </div>
    </div>
  );
}
