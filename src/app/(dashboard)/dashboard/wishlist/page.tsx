import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getWishlist } from "@/features/dashboard/queries";
import { startCheckout } from "@/features/checkout/actions";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();
  const wishlist = await getWishlist(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Wishlist"
        description="Courses you've saved for later."
      />

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any course to save it here for later."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((course) => {
            const price = course.discountPrice ?? course.price;
            return (
              <div key={course.id} className="flex flex-col gap-3">
                <CourseCard course={course} className="h-full" />
                <form action={startCheckout.bind(null, course.slug)}>
                  <Button type="submit" variant="gradient" className="w-full">
                    Enroll now · {formatCurrency(price, course.currency)}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
