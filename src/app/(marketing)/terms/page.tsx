import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing your use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 2026"
      intro={`These Terms of Service ("Terms") govern your access to and use of ${siteConfig.name} (the "Platform"). By creating an account or enrolling in a course, you agree to these Terms.`}
      sections={[
        {
          heading: "1. Accounts",
          body: [
            "You must provide accurate information when creating an account and keep your credentials secure. You are responsible for all activity that occurs under your account.",
            "You must be at least 13 years old to use the Platform. Learners under the age of majority in their country should use the Platform under the supervision of a parent or guardian.",
          ],
        },
        {
          heading: "2. Enrollment & access",
          body: [
            "When you enroll in a course — whether free or paid — we grant you a personal, non-exclusive, non-transferable license to access that course's content for your own learning.",
            "You may not share, resell, sublicense, publicly perform, or redistribute course content without our written permission.",
          ],
        },
        {
          heading: "3. Payments",
          body: [
            "Paid courses are billed at the price shown at checkout, in the currency displayed. Applicable taxes may be added.",
            "Coupons and promotional pricing are limited-time offers and may be withdrawn at any time. Refunds are handled under our Refund Policy.",
          ],
        },
        {
          heading: "4. Acceptable use",
          body: [
            "You agree not to misuse the Platform — including attempting to gain unauthorized access, disrupting service, scraping content, or uploading unlawful, infringing, or harmful material.",
            "Instructors are responsible for ensuring they have the rights to the content they publish and that it complies with these Terms.",
          ],
        },
        {
          heading: "5. Intellectual property",
          body: [
            "All Platform software, branding, and original content are owned by D-MATHS or its licensors. Course content remains the property of its respective instructors, licensed to the Platform for distribution.",
          ],
        },
        {
          heading: "6. Disclaimers & liability",
          body: [
            "The Platform is provided “as is.” While we strive for accuracy and uptime, we do not guarantee that content is error-free or that the service will be uninterrupted.",
            "To the maximum extent permitted by law, D-MATHS is not liable for indirect or consequential damages arising from your use of the Platform.",
          ],
        },
        {
          heading: "7. Changes to these Terms",
          body: [
            "We may update these Terms from time to time. Material changes will be announced on the Platform. Continued use after changes take effect constitutes acceptance of the revised Terms.",
          ],
        },
      ]}
    />
  );
}
