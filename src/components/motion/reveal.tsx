"use client";

import { m } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper using Framer Motion (`m` — the tree-shaken component
 * enabled by LazyMotion in providers). Fades + rises children into view once.
 * Respects reduced-motion via the global MotionConfig.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const MotionTag = m[as];
  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
