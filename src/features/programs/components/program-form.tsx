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
import { createProgram, updateProgram, type ProgramActionState } from "../actions";

export interface ProgramFormDefaults {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  format?: string;
  location?: string;
  price?: number;
  discountPrice?: number | null;
  capacity?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  enrollmentDeadline?: string | null;
  published?: boolean;
}

export function ProgramForm({
  programId,
  defaults,
  storageEnabled = false,
}: {
  programId?: string;
  defaults?: ProgramFormDefaults;
  storageEnabled?: boolean;
}) {
  const action = programId ? updateProgram.bind(null, programId) : createProgram;
  const [state, formAction] = useActionState<ProgramActionState, FormData>(
    action,
    undefined,
  );

  const [coverUrl, setCoverUrl] = React.useState(defaults?.coverUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [coverError, setCoverError] = React.useState<string | null>(null);

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError(null);
    if (!file.type.startsWith("image/")) {
      setCoverError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCoverError("Image is over 8MB — please use a smaller one.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `programs/${programId ?? "new"}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-thumbnails")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } catch {
      setCoverError("Upload failed. Paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {state && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
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
        <Label htmlFor="title">Program title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. Data Analysis Bootcamp — October Cohort"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          URL slug{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={defaults?.slug}
          placeholder="data-analysis-bootcamp-oct"
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

      {/* Cover image */}
      <div className="space-y-2">
        <Label>Cover image</Label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl border bg-muted">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt="Cover preview"
                fill
                unoptimized
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
                  onChange={handleCover}
                />
              </label>
            )}
            <Input
              name="coverUrl"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Or paste an image URL"
              aria-label="Cover image URL"
            />
            {coverError && <p className="text-sm text-destructive">{coverError}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Input
            id="format"
            name="format"
            defaultValue={defaults?.format ?? "Online live"}
            placeholder="Online live"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="Zoom / Lagos"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={defaults?.price ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPrice">Discount price (₦)</Label>
          <Input
            id="discountPrice"
            name="discountPrice"
            type="number"
            min={0}
            defaultValue={defaults?.discountPrice ?? ""}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={0}
            defaultValue={defaults?.capacity ?? ""}
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaults?.startDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={defaults?.endDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enrollmentDeadline">Enrolment deadline</Label>
          <Input
            id="enrollmentDeadline"
            name="enrollmentDeadline"
            type="date"
            defaultValue={defaults?.enrollmentDeadline ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          rows={10}
          placeholder="What the program covers, who it's for, the schedule, outcomes… Leave a blank line between paragraphs."
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border p-3.5">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaults?.published}
          className="size-4 rounded border-input accent-primary"
        />
        <span>
          <span className="font-medium">Published</span>
          <span className="block text-xs text-muted-foreground">
            Uncheck to save as a draft (hidden from the public programs page).
          </span>
        </span>
      </label>

      <SubmitButton variant="gradient" pendingText="Saving…">
        {programId ? "Save changes" : "Create program"}
      </SubmitButton>
    </form>
  );
}
