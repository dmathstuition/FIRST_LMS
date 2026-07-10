import { AlertCircle } from "lucide-react";

/** Inline error banner for auth forms (announced to screen readers). */
export function AuthError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}
