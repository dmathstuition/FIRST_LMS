import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 2026"
      intro={`This Privacy Policy explains what information ${siteConfig.name} collects, how we use it, and the choices you have. We collect only what we need to run the Platform and improve your learning experience.`}
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "Account information: your name, email address, and profile details you choose to provide.",
            "Learning activity: courses you enroll in, lesson progress, quiz results, notes, and certificates you earn.",
            "Payment information: when you buy a course, payments are processed by our payment providers. We do not store full card numbers on our servers.",
            "Technical data: basic device, browser, and usage information used to keep the service secure and reliable.",
          ],
        },
        {
          heading: "2. How we use your information",
          body: [
            "To provide the Platform — authenticate you, deliver courses, track progress, and issue certificates.",
            "To communicate with you about your account, purchases, and updates you have opted into.",
            "To improve the Platform, understand which content is helpful, and keep the service safe from abuse.",
          ],
        },
        {
          heading: "3. Sharing",
          body: [
            "We do not sell your personal data. We share information only with service providers that help us operate the Platform (such as hosting, authentication, and payment processing), and only as needed to provide the service.",
            "We may disclose information if required by law or to protect the rights and safety of our users.",
          ],
        },
        {
          heading: "4. Data security",
          body: [
            "We use industry-standard measures — including encrypted connections and row-level access controls — to protect your data. No system is perfectly secure, but we work continuously to safeguard your information.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You can access and update your profile at any time from your account settings. You may request a copy of your data or ask us to delete your account by contacting us.",
          ],
        },
        {
          heading: "6. Cookies",
          body: [
            "We use essential cookies to keep you signed in and to remember your preferences (such as light/dark theme). You can control cookies through your browser settings.",
          ],
        },
        {
          heading: "7. Changes to this policy",
          body: [
            "We may update this Privacy Policy as the Platform evolves. Material changes will be announced on the Platform.",
          ],
        },
      ]}
    />
  );
}
