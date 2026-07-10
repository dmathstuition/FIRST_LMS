"use client";

import { useActionState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Reveal } from "@/components/motion/reveal";
import {
  subscribeToNewsletter,
  type NewsletterResult,
} from "@/features/newsletter/actions";

/** Email capture band with a Server Action + inline result feedback. */
export function Newsletter() {
  const [state, formAction] = useActionState<
    NewsletterResult | undefined,
    FormData
  >(subscribeToNewsletter, undefined);

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-brand-900 px-6 py-14 text-center text-white sm:px-12">
            <div className="animated-gradient absolute inset-0 opacity-90" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_50%)]" />

            <div className="relative z-10 mx-auto max-w-xl">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Mail className="size-7" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Get learning tips &amp; new course drops
              </h2>
              <p className="mt-3 text-white/80">
                Join our newsletter for study strategies, free lessons, and early
                access to new courses. No spam, ever.
              </p>

              <form
                action={formAction}
                className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="h-12 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white"
                />
                <SubmitButton
                  size="lg"
                  className="h-12 bg-white text-brand-900 hover:bg-white/90"
                  pendingText="Joining…"
                >
                  Subscribe
                </SubmitButton>
              </form>

              {state && (
                <p
                  role="status"
                  className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                    state.ok ? "text-white" : "text-red-200"
                  }`}
                >
                  {state.ok ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <AlertCircle className="size-4" />
                  )}
                  {state.message}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
