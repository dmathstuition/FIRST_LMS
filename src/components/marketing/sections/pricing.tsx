import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types";

const plans: PricingPlan[] = [
  {
    name: "Single Course",
    price: 49,
    period: "one-time",
    description: "Perfect for focused learning on one topic.",
    features: [
      "Lifetime access to one course",
      "Certificate of completion",
      "Downloadable resources",
      "Community & Q&A access",
      "30-day money-back guarantee",
    ],
    cta: "Browse courses",
  },
  {
    name: "Pro Membership",
    price: 19,
    period: "per month",
    description: "Unlimited access to our entire library.",
    features: [
      "Unlimited access to all courses",
      "All certificates included",
      "AI tutor & quiz generator",
      "Priority support",
      "New courses every month",
      "Cancel anytime",
    ],
    highlighted: true,
    cta: "Start Pro",
  },
  {
    name: "Teams",
    price: 99,
    period: "per month",
    description: "For organizations upskilling their people.",
    features: [
      "Everything in Pro",
      "Up to 20 team members",
      "Team analytics dashboard",
      "Dedicated success manager",
      "Custom learning paths",
      "Invoiced billing",
    ],
    cta: "Contact sales",
  },
];

/** Pricing plans section. */
export function Pricing() {
  return (
    <section id="pricing" className="border-y bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Start free. Upgrade when you're ready. Cancel anytime."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-sm",
                  plan.highlighted &&
                    "border-primary shadow-lg ring-1 ring-primary lg:-mt-4 lg:mb-4",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow">
                    <Sparkles className="size-3" /> Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlighted ? "gradient" : "outline"}
                  className="mt-7 w-full"
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
