"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Prints the current page (browser "Save as PDF" gives a downloadable receipt). */
export function PrintButton({ label = "Print receipts" }: { label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" /> {label}
    </Button>
  );
}
