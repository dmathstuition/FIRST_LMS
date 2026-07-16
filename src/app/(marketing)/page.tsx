import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { Hero } from "@/components/marketing/sections/hero";
import { SkillsMarquee } from "@/components/marketing/sections/skills-marquee";
import { Stats } from "@/components/marketing/sections/stats";
import { FeaturedCourses } from "@/components/marketing/sections/featured-courses";
import { Categories } from "@/components/marketing/sections/categories";
import { WhyUs } from "@/components/marketing/sections/why-us";
import { Instructor } from "@/components/marketing/sections/instructor";
import { Testimonials } from "@/components/marketing/sections/testimonials";
import { Pricing } from "@/components/marketing/sections/pricing";
import { Faq } from "@/components/marketing/sections/faq";
import { Newsletter } from "@/components/marketing/sections/newsletter";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/**
 * Landing page — composed of independently-cached section components. Course
 * data sections are async Server Components; the rest are static/animated.
 */
export default function HomePage() {
  return (
    <>
      {/* Organization structured data for SEO / rich results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
            logo: absoluteUrl("/icon.png"),
            sameAs: Object.values(siteConfig.links),
          }),
        }}
      />

      <Hero />
      <SkillsMarquee />
      <Stats />
      <FeaturedCourses />
      <Categories />
      <WhyUs />
      <Instructor />
      <Testimonials />
      <Pricing />
      <Faq />
      <Newsletter />
    </>
  );
}
