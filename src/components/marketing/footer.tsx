import Link from "next/link";
import { Twitter, Github, Youtube, Linkedin } from "lucide-react";

import { Logo } from "@/components/logo";

import { siteConfig, footerNav } from "@/config/site";

/** Site footer with link groups + social icons. Server-rendered. */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Logo className="size-5" />
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialLink href={siteConfig.links.twitter} label="Twitter">
                <Twitter className="size-4" />
              </SocialLink>
              <SocialLink href={siteConfig.links.github} label="GitHub">
                <Github className="size-4" />
              </SocialLink>
              <SocialLink href={siteConfig.links.youtube} label="YouTube">
                <Youtube className="size-4" />
              </SocialLink>
              <SocialLink href={siteConfig.links.linkedin} label="LinkedIn">
                <Linkedin className="size-4" />
              </SocialLink>
            </div>
          </div>

          {/* Link groups */}
          {footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Built with Next.js, Supabase & ❤️</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
