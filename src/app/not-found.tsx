import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Global 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="gradient">
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </div>
  );
}
