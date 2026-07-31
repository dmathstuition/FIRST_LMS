import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `The refund terms for courses purchased on ${siteConfig.name}.`,
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="July 2026"
      intro={`We want you to learn with confidence. This Refund Policy explains when and how you can request a refund for a course purchased on ${siteConfig.name}.`}
      sections={[
        {
          heading: "1. 14-day money-back guarantee",
          body: [
            "If a paid course isn't the right fit, you can request a full refund within 14 days of purchase — no complicated forms. This applies as long as you have not completed a substantial portion of the course (see below).",
          ],
        },
        {
          heading: "2. Eligibility",
          body: [
            "Refunds are available when your request is made within 14 days of purchase and you have completed less than 40% of the course lessons.",
            "Refunds may be declined where we detect abuse of this policy — for example, repeatedly enrolling, consuming the material, and refunding the same or similar courses.",
          ],
        },
        {
          heading: "3. How to request a refund",
          body: [
            "Email us at hello@dmaths.io from the address on your account, including your order number and the course title. Once approved, refunds are issued to your original payment method.",
          ],
        },
        {
          heading: "4. Processing time",
          body: [
            "Approved refunds are typically processed within 5–10 business days, depending on your payment provider and bank.",
          ],
        },
        {
          heading: "5. Coupons & bundles",
          body: [
            "Courses purchased as part of a bundle are refunded according to the bundle's terms shown at checkout. Promotional credits and coupons are non-refundable for cash value.",
          ],
        },
        {
          heading: "6. Free courses",
          body: [
            "Free courses carry no charge and therefore are not eligible for a refund. You can unenroll from a free course at any time.",
          ],
        },
      ]}
    />
  );
}
