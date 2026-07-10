import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getWishlist } from "@/features/dashboard/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/dashboard/empty-state";

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
          {wishlist.map((course) => (
            <CourseCard key={course.id} course={course} className="h-full" />
          ))}
        </div>
      )}
    </div>
  );
}
