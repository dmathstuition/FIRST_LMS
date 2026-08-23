"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { getCourseBySlug } from "@/features/courses/queries";
import { getPaymentProvider } from "@/lib/payments";
import { recordPurchaseAndEnroll } from "./service";

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/**
 * Begin checkout for a course. Requires a signed-in user. Free courses enroll
 * directly; paid courses create a Paystack (or mock) checkout and redirect the
 * learner to the hosted payment page. Amounts are converted to kobo for
 * Paystack. Bound to a slug from the course page's <form action>.
 */
export async function startCheckout(courseSlug: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/courses/${courseSlug}`)}`);
  }

  const course = await getCourseBySlug(courseSlug);
  if (!course) redirect("/courses");

  const nairaPrice = course.discountPrice ?? course.price;
  const origin = await siteOrigin();
  const successUrl = `${origin}/checkout/callback?course=${encodeURIComponent(courseSlug)}`;
  const cancelUrl = `${origin}/courses/${encodeURIComponent(courseSlug)}`;

  // Free course: enroll straight away and open the player.
  if (!nairaPrice || nairaPrice <= 0) {
    await recordPurchaseAndEnroll({
      userId: user.id,
      courseId: course.id,
      courseTitle: course.title,
      nairaAmount: 0,
      reference: `free_${Date.now()}`,
    });
    redirect(`/learn/${courseSlug}`);
  }

  const provider = getPaymentProvider("paystack");
  const session = await provider.createCheckout({
    userId: user.id,
    email: user.email ?? "",
    currency: "NGN",
    items: [
      {
        courseId: course.id,
        title: course.title,
        unitAmount: Math.round(nairaPrice * 100), // Naira → kobo
        quantity: 1,
      },
    ],
    successUrl,
    cancelUrl,
    metadata: { courseSlug, courseTitle: course.title },
  });

  redirect(session.url);
}
