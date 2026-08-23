import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { getCourseBySlug } from "@/features/courses/queries";
import {
  getPaymentProvider,
  hasLivePayments,
  PaystackProvider,
} from "@/lib/payments";
import { recordPurchaseAndEnroll } from "@/features/checkout/service";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Order confirmation" };

// Verifies against Paystack on each load, so it must never be statically cached.
export const dynamic = "force-dynamic";

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const courseSlug = one(sp.course);
  const reference =
    one(sp.reference) ?? one(sp.trxref) ?? one(sp.mock_reference);

  const user = await getSessionUser();
  const course = courseSlug ? await getCourseBySlug(courseSlug) : null;

  let success = false;
  if (reference?.startsWith("mock_")) {
    // Demo mode: the mock provider round-trips straight to success.
    success = true;
  } else if (reference && hasLivePayments()) {
    const provider = getPaymentProvider("paystack") as PaystackProvider;
    const result = await provider.verifyTransaction(reference);
    success = result.type === "payment.succeeded";
  }

  if (success && user && course) {
    await recordPurchaseAndEnroll({
      userId: user.id,
      courseId: course.id,
      courseTitle: course.title,
      nairaAmount: course.discountPrice ?? course.price,
      reference: reference ?? `unknown_${Date.now()}`,
    });
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        {success ? (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Payment successful</h1>
            <p className="mt-2 text-muted-foreground">
              {course
                ? `You're enrolled in "${course.title}". Time to start learning.`
                : "Your enrollment is confirmed."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {course && (
                <Button asChild size="lg" variant="gradient">
                  <Link href={`/learn/${course.slug}`}>Start learning</Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
              <XCircle className="size-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Payment not completed</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t confirm your payment. You haven&apos;t been
              charged. Please try again, or contact support if the problem
              persists.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg" variant="gradient">
                <Link href={courseSlug ? `/courses/${courseSlug}` : "/courses"}>
                  Try again
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
