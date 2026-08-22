"use client";

import * as React from "react";
import { Plus, Upload, Video, CheckCircle2, Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Add-lesson form with direct-to-Storage video upload.
 *
 * When the lesson type is "video", the instructor can either upload a video
 * file (streamed straight to the Supabase `course-videos` bucket from the
 * browser — no 4.5MB server-action limit) or paste a URL / YouTube link. The
 * resulting URL is submitted with the bound `addLesson` server action.
 */
export function AddLessonForm({
  action,
  courseId,
  sectionId,
  sectionTitle,
  storageEnabled,
}: {
  action: (formData: FormData) => void | Promise<void>;
  courseId: string;
  sectionId: string;
  sectionTitle: string;
  storageEnabled: boolean;
}) {
  const [type, setType] = React.useState("video");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    // Guardrail: keep uploads reasonable (Supabase default cap is 50MB unless
    // raised in project settings). Tell the user rather than failing opaquely.
    if (file.size > 500 * 1024 * 1024) {
      setError("That video is over 500MB — please compress it or host it and paste the URL.");
      return;
    }

    setUploading(true);
    setFileName(file.name);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${courseId}/${sectionId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-videos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage
        .from("course-videos")
        .getPublicUrl(path);
      setVideoUrl(data.publicUrl);
    } catch {
      setError("Upload failed. Check your connection, or paste a video URL instead.");
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }

  const isVideo = type === "video";

  return (
    <form action={action} className="space-y-3 border-t p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="title"
          placeholder="New lesson title…"
          required
          className="flex-1"
          aria-label={`New lesson in ${sectionTitle}`}
        />
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Lesson type"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="video">Video</option>
          <option value="text">Text</option>
          <option value="markdown">Markdown</option>
          <option value="pdf">PDF</option>
          <option value="quiz">Quiz</option>
        </select>
        <Button type="submit" variant="outline" size="sm" disabled={uploading}>
          <Plus className="size-4" /> Add lesson
        </Button>
      </div>

      {isVideo && (
        <div className="rounded-lg border border-dashed bg-muted/20 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Upload */}
            <div className="flex-1">
              {storageEnabled ? (
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
                  ) : videoUrl ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Video ready — replace?
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" /> Upload a video file
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="sr-only"
                    onChange={handleFile}
                    disabled={uploading}
                  />
                </label>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Connect Supabase to upload video files. You can still paste a
                  hosted video or YouTube URL below.
                </p>
              )}
            </div>

            <span className="text-center text-xs text-muted-foreground">or</span>

            {/* URL fallback */}
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste video URL or YouTube link"
              className="flex-1"
              aria-label="Video URL"
            />
          </div>

          {fileName && !error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Video className="size-3.5" /> {fileName}
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  setVideoUrl("");
                }}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear video"
              >
                <X className="size-3.5" />
              </button>
            </p>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

          {/* Extra fields */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Duration (min)</span>
              <Input
                name="durationMinutes"
                type="number"
                min={0}
                defaultValue={0}
                className="h-8 w-20"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="isPreview" className="size-4" />
              Free preview (viewable before purchase)
            </label>
          </div>

          {/* Submitted with the form */}
          <input type="hidden" name="videoUrl" value={videoUrl} />
        </div>
      )}
    </form>
  );
}
