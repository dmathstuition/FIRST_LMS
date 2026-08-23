"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { createCourse, updateCourse, type FormState } from "../actions";
import type { Category } from "@/types";

export interface CourseFormDefaults {
  title?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  level?: "beginner" | "intermediate" | "advanced" | "all";
  price?: number;
  thumbnailUrl?: string;
}

/**
 * Create/edit course form. When `courseId` is provided it edits (bound
 * updateCourse); otherwise it creates (createCourse, which redirects to the
 * new course's builder on success).
 */
export function CourseForm({
  categories,
  defaults,
  courseId,
  basePath = "/instructor",
  storageEnabled = false,
}: {
  categories: Category[];
  defaults?: CourseFormDefaults;
  courseId?: string;
  /** "/instructor" or "/admin" — where create redirects and edits revalidate. */
  basePath?: string;
  /** True when Supabase Storage is available for image upload. */
  storageEnabled?: boolean;
}) {
  const action = courseId
    ? updateCourse.bind(null, basePath, courseId)
    : createCourse.bind(null, basePath);
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const [thumbUrl, setThumbUrl] = React.useState(defaults?.thumbnailUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [thumbError, setThumbError] = React.useState<string | null>(null);

  async function handleThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbError(null);
    if (!file.type.startsWith("image/")) {
      setThumbError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setThumbError("Image is over 8MB — please use a smaller one.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${courseId ?? "new"}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-thumbnails")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(path);
      setThumbUrl(data.publicUrl);
    } catch {
      setThumbError("Upload failed. Paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {state && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Course title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. Mastering Calculus from Scratch"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={defaults?.subtitle}
          placeholder="A short, compelling one-liner"
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Cover image</Label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl border bg-muted">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt="Course cover preview"
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-8" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {storageEnabled && (
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors hover:border-primary/50",
                  uploading && "pointer-events-none opacity-70",
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="size-4" /> Upload cover image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleThumb}
                  disabled={uploading}
                />
              </label>
            )}
            <Input
              value={thumbUrl}
              onChange={(e) => setThumbUrl(e.target.value)}
              placeholder="…or paste an image URL"
              aria-label="Cover image URL"
            />
            <p className="text-xs text-muted-foreground">
              Recommended 1280×720 (16:9).{" "}
              {storageEnabled
                ? "JPG or PNG, up to 8MB."
                : "Connect Supabase to upload files."}
            </p>
            {thumbError && (
              <p className="text-xs text-destructive">{thumbError}</p>
            )}
          </div>
        </div>
        <input type="hidden" name="thumbnailUrl" value={thumbUrl} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaults?.categoryId ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue={defaults?.level ?? "all"}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="100"
            defaultValue={defaults?.price ?? 0}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          rows={6}
          placeholder="Describe what students will learn and why it matters…"
        />
      </div>

      <SubmitButton variant="gradient" pendingText="Saving…">
        {courseId ? "Save changes" : "Create course"}
      </SubmitButton>
    </form>
  );
}
