import { Star, Quote } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Testimonial } from "@/types";

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Kwame Osei",
    role: "Engineering Student",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
    quote:
      "DMATHS didn't just teach me formulas — it gave me the intuition to actually understand. I finally get calculus.",
    rating: 5,
  },
  {
    id: "2",
    name: "Amara Nwosu",
    role: "Frontend Developer",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces",
    quote:
      "The Next.js course was the most practical course I've ever taken. I shipped a real product before I even finished it.",
    rating: 5,
  },
  {
    id: "3",
    name: "Daniel Park",
    role: "Data Analyst",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces",
    quote:
      "The AI tutor is a game changer. It's like having a patient expert available 24/7 whenever I'm stuck.",
    rating: 5,
  },
  {
    id: "4",
    name: "Sofia Rossi",
    role: "Product Designer",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=faces",
    quote:
      "Beautiful platform, world-class teaching. The certificate helped me land interviews within weeks.",
    rating: 5,
  },
  {
    id: "5",
    name: "Liam Walsh",
    role: "Self-taught Programmer",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=faces",
    quote:
      "I've tried every platform out there. Nothing comes close to how clearly DMATHS explains hard concepts.",
    rating: 5,
  },
  {
    id: "6",
    name: "Zainab Ali",
    role: "High School Teacher",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=faces",
    quote:
      "I now recommend DMATHS to all my students. The SAT prep alone raised their scores dramatically.",
    rating: 5,
  },
];

/** Social-proof testimonials grid. */
export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Loved by learners"
          title="Join thousands who transformed their skills"
          subtitle="Real stories from students building real careers."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm">
                <Quote className="size-7 text-primary/30" />
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                  <Avatar>
                    {t.avatarUrl && <AvatarImage src={t.avatarUrl} alt="" />}
                    <AvatarFallback>{getInitials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
