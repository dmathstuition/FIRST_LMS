"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createCoupon, type ActionState } from "../actions";

/** Create-coupon form. */
export function CouponForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createCoupon,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="WELCOME20" required className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountType">Type</Label>
          <select
            id="discountType"
            name="discountType"
            defaultValue="percent"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed amount ($)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min={1} step="1" placeholder="20" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Max redemptions (0 = unlimited)</Label>
          <Input id="maxRedemptions" name="maxRedemptions" type="number" min={0} defaultValue={0} />
        </div>
        <div className="sm:col-span-2">
          <SubmitButton variant="gradient" pendingText="Creating…">
            <Plus className="size-4" /> Create coupon
          </SubmitButton>
        </div>
      </form>
      {state && (
        <p
          role="status"
          className={`mt-3 flex items-center gap-1.5 text-sm ${
            state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </p>
      )}
    </div>
  );
}
