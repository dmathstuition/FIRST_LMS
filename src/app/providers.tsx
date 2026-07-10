"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

import { Toaster } from "@/components/ui/toaster";

/**
 * Global client providers:
 *  - next-themes for system-aware dark mode (class strategy).
 *  - Framer Motion LazyMotion (loads only the DOM animation feature bundle) +
 *    MotionConfig to honor reduced-motion preferences globally.
 *  - Toaster for transient notifications.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
        </MotionConfig>
      </LazyMotion>
    </NextThemesProvider>
  );
}
