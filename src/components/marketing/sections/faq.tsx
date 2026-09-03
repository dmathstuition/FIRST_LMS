import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types";

const faqs: FaqItem[] = [
  {
    question: "Do I get lifetime access to courses I buy?",
    answer:
      "Yes. Every course you purchase is yours forever, including all future updates. Learn at your own pace with no expiry.",
  },
  {
    question: "Are the certificates recognized?",
    answer:
      "You'll earn a certificate of completion with a unique ID and QR code that anyone can verify on our public verification page. Many learners add them to LinkedIn and resumes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support cards via Stripe, plus Paystack and Flutterwave for local payments across Africa. All transactions are secure and encrypted.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Absolutely. We offer a 30-day money-back guarantee on course purchases — no questions asked.",
  },
  {
    question: "Do you offer support if I get stuck?",
    answer:
      "Every lesson has a discussion section and Q&A. Pro members also get an AI tutor available 24/7 and priority human support.",
  },
  {
    question: "Who teaches the courses?",
    answer:
      "Every course is created and taught by D-MATHS — a Web Developer, Data Analyst, and AI Engineer — so the teaching, quality, and support all come from one trusted source.",
  },
];

/** Frequently-asked-questions accordion. Also emits FAQ structured data. */
export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions? We've got answers"
          subtitle="Everything you need to know before you start learning."
        />

        <Reveal className="mt-10">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>

      {/* FAQ structured data for rich search results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
    </section>
  );
}
