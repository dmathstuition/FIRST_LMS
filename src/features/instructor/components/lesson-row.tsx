"use client";

import * as React from "react";
import {
  Video,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDuration, cn } from "@/lib/utils";
import type { CurriculumLesson } from "../types";

/**
 * A single curriculum lesson row with inline edit + delete. Editing reuses the
 * same video-source pattern as the add form (upload to Storage or paste a URL);
 * leaving the video blank keeps the current one. Delete confirms first.
 */
export function LessonRow({
  lesson,
  courseId,
  sectionId,
  storageEnabled,
  updateAction,
  deleteAction,
}: {
  lesson: CurriculumLesson;
  courseId: string;
  sectionId: string;
  storageEnabled: boolean;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: () => void | Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const [type, setType] = React.useState(lesson.type);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Over 500MB — compress it or paste a hosted URL instead.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${courseId}/${sectionId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-videos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("course-videos").getPublicUrl(path);
      setVideoUrl(data.publicUrl);
    } catch {
      setError("Upload failed. Paste a video URL instead.");
    } finally {
      setUploading(false);
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center gap-3 px-4 py-3 text-sm">
        {lesson.type === "video" ? (
          <Video className="size-4 text-primary" />
        ) : (
          <FileText className="size-4 text-primary" />
        )}
        <span className="flex-1 truncate">{lesson.title}</span>
        {lesson.isPreview && (
          <Badge variant="accent" className="gap-1">
            <Eye className="size-3" /> Preview
          </Badge>
        )}
        {lesson.durationMinutes > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(lesson.durationMinutes)}
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Edit ${lesson.title}`}
        >
          <Pencil className="size-4" />
        </button>
        <form action={deleteAction}>
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm(`Delete "${lesson.title}"? This can't be undone.`)) {
                e.preventDefault();
              }
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${lesson.title}`}
          >
            <Trash2 className="size-4" />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="px-4 py-3">
      <form
        action={updateAction}
        onSubmit={() => setEditing(false)}
        className="space-y-3 rounded-lg border bg-muted/20 p-3"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            name="title"
            defaultValue={lesson.title}
            required
            className="flex-1"
            aria-label="Lesson title"
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
        </div>

        {type === "video" && (
          <div className="rounded-lg border border-dashed bg-background/60 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {storageEnabled ? (
                <label
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors hover:border-primary/50",
                    uploading && "pointer-events-none opacity-70",
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Uploading…
                    </>
                  ) : videoUrl ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" /> New
                      video ready
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" /> Replace video file
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
                <p className="flex-1 text-xs text-muted-foreground">
                  Connect Supabase to upload files, or paste a URL.
                </p>
              )}
              <span className="text-center text-xs text-muted-foreground">
                or
              </span>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="New video URL (blank = keep current)"
                className="flex-1"
                aria-label="Video URL"
              />
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Duration (min)</span>
            <Input
              name="durationMinutes"
              type="number"
              min={0}
              defaultValue={lesson.durationMinutes}
              className="h-8 w-20"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              name="isPreview"
              defaultChecked={lesson.isPreview}
              className="size-4"
            />
            Free preview
          </label>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              <X className="size-4" /> Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={uploading}
            >
              Save
            </Button>
          </div>
        </div>

        <input type="hidden" name="videoUrl" value={videoUrl} />
      </form>
    </li>
  );
}
