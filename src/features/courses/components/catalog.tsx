"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, CourseCard as CourseCardType } from "@/types";

type SortKey = "popular" | "rating" | "price-asc" | "price-desc";

/**
 * Interactive course catalog: client-side search, category filter, and sort
 * over the server-provided dataset. Keeps the URL in sync for the category so
 * links from the landing page ("?category=") pre-filter correctly.
 */
export function Catalog({
  courses,
  categories,
  initialCategory,
}: {
  courses: CourseCardType[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState(initialCategory ?? "all");
  const [sort, setSort] = React.useState<SortKey>("popular");

  const filtered = React.useMemo(() => {
    let list = courses;

    if (category !== "all") {
      list = list.filter((c) => c.category?.slug === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.instructor?.fullName.toLowerCase().includes(q),
      );
    }

    const effectivePrice = (c: CourseCardType) => c.discountPrice ?? c.price;
    return [...list].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.ratingAvg - a.ratingAvg;
        case "price-asc":
          return effectivePrice(a) - effectivePrice(b);
        case "price-desc":
          return effectivePrice(b) - effectivePrice(a);
        default:
          return b.studentCount - a.studentCount;
      }
    });
  }, [courses, category, query, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics, instructors…"
            className="pl-9"
            aria-label="Search courses"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <label htmlFor="sort" className="sr-only">
            Sort courses
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="popular">Most popular</option>
            <option value="rating">Highest rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => setCategory("all")}
        >
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-muted-foreground">
        {filtered.length} course{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} className="h-full" />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed p-12 text-center">
          <p className="font-medium">No courses match your search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or category.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
