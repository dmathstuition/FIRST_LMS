/**
 * Global site configuration — brand identity, navigation, SEO defaults.
 * Single source of truth consumed by the layout, navbar, footer, and metadata.
 */

export const siteConfig = {
  name: "D-MATHS Learning Hub",
  shortName: "D-MATHS",
  tagline: "Learn the skills schools skip — taught properly",
  description:
    "D-MATHS is a founder-led learning studio for mathematics, coding for kids, data and AI — real understanding over rote memorisation, for learners across Africa and beyond.",
  url: "https://dmaths-learning-hub.vercel.app",
  ogImage: "/og.png",
  locale: "en_US",
  keywords: [
    "online courses",
    "e-learning",
    "mathematics",
    "coding",
    "LMS",
    "D-MATHS",
    "certificates",
    "learn online",
  ],
  contactEmail: "hello@dmaths.io",
  links: {
    twitter: "https://twitter.com/dmaths",
    github: "https://github.com/dmathstuition",
    youtube: "https://youtube.com/@dmaths",
    linkedin: "https://linkedin.com/company/dmaths",
  },
  /** Brand color tokens (kept in sync with globals.css / tailwind.config.ts). */
  colors: {
    primary: "#2563EB",
    dark: "#0F172A",
    light: "#FFFFFF",
    accent: "#F97316",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Primary marketing navigation. */
export const marketingNav = [
  { title: "Courses", href: "/courses" },
  { title: "Categories", href: "/#categories" },
  { title: "Pricing", href: "/#pricing" },
  { title: "Blog", href: "/blog" },
  { title: "Verify Certificate", href: "/verify" },
] as const;

/** Footer link groups. */
export const footerNav = [
  {
    title: "Platform",
    links: [
      { title: "Browse Courses", href: "/courses" },
      { title: "Pricing", href: "/#pricing" },
      { title: "Certificate Verification", href: "/verify" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/#founder" },
      { title: "Blog", href: "/blog" },
      { title: "Testimonials", href: "/#testimonials" },
      { title: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Refund Policy", href: "/refunds" },
    ],
  },
] as const;
