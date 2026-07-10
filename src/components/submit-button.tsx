"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Submit button that reflects the parent <form>'s pending state (React 19 +
 * Server Actions). Shows a spinner and disables while the action runs.
 */
export function SubmitButton({
  children,
  className,
  pendingText,
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(className)}
      {...props}
    >
      {pending && <Loader2 className="animate-spin" />}
      {pending ? (pendingText ?? "Please wait…") : children}
    </Button>
  );
}
