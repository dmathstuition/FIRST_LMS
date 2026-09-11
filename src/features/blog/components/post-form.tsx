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
import {
  createPost,
  updatePost,
  type BlogActionState,
} from "../actions";

export interface PostFormDefaults {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  tags?: string[];
  published?: boolean;
}

/**
 * Create/edit blog post form. When `postId` is provided it edits (bound
 * updatePost); otherwise it creates (createPost, which redirects to the admin
 * blog list on success).
 */
export function PostForm({
  postId,
  defaults,
  storageEnabled = false,
}: {
  postId?: string;
  defaults?: PostFormDefaults;
  storageEnabled?: boolean;
}) {
  const action = postId
    ? updatePost.bind(null, postId)
    : createPost;
  const [state, formAction] = useActionState<BlogActionState, FormData>(
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
      const path = `blog/${postId ?? "new"}/${Date.now()}.${ext}`;
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. How to actually understand maths"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          URL slug{" "}
          <span className="font-normal text-muted-foreground">
            (optional — auto-generated from the title)
          </span>
        </Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={defaults?.slug}
          placeholder="how-to-understand-maths"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={defaults?.excerpt}
          rows={2}
          placeholder="A short summary shown on the blog index and previews."
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
            {coverError && (
              <p className="text-sm text-destructive">{coverError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">
          Tags{" "}
          <span className="font-normal text-muted-foreground">
            (comma-separated)
          </span>
        </Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(", ")}
          placeholder="Learning, Mathematics, Study tips"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={defaults?.content}
          rows={16}
          placeholder="Write your post here. Leave a blank line between paragraphs."
          className="font-mono text-sm leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Plain text with paragraph breaks. Separate paragraphs with a blank
          line.
        </p>
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
            Uncheck to save as a draft (hidden from the public blog).
          </span>
        </span>
      </label>

      <SubmitButton variant="gradient" pendingText="Saving…">
        {postId ? "Save changes" : "Create post"}
      </SubmitButton>
    </form>
  );
}
