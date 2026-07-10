import {
  Plus,
  Video,
  FileText,
  Eye,
  GripVertical,
  Layers,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { addSection, addLesson } from "../actions";
import type { CurriculumSection } from "../types";

/**
 * Curriculum editor: lists sections and their lessons, with inline forms to add
 * new sections and lessons. Forms post directly to Server Actions (bound with
 * the relevant ids); the page revalidates after each mutation.
 */
export function CurriculumEditor({
  courseId,
  sections,
}: {
  courseId: string;
  sections: CurriculumSection[];
}) {
  return (
    <div className="space-y-5">
      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Layers className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No sections yet. Add your first section below to start building your
            curriculum.
          </p>
        </div>
      )}

      {sections.map((section, i) => (
        <Card key={section.id} className="overflow-hidden">
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
            <GripVertical className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section {i + 1}
            </span>
            <h3 className="font-medium">{section.title}</h3>
            <span className="ml-auto text-xs text-muted-foreground">
              {section.lessons.length} lesson
              {section.lessons.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Lessons */}
          <ul className="divide-y">
            {section.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
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
              </li>
            ))}
          </ul>

          {/* Add lesson */}
          <form
            action={addLesson.bind(null, courseId, section.id)}
            className="flex flex-col gap-2 border-t p-3 sm:flex-row"
          >
            <Input
              name="title"
              placeholder="New lesson title…"
              required
              className="flex-1"
              aria-label={`New lesson in ${section.title}`}
            />
            <select
              name="type"
              defaultValue="video"
              aria-label="Lesson type"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="markdown">Markdown</option>
              <option value="pdf">PDF</option>
              <option value="quiz">Quiz</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              <Plus className="size-4" /> Add lesson
            </Button>
          </form>
        </Card>
      ))}

      {/* Add section */}
      <form
        action={addSection.bind(null, courseId)}
        className="flex flex-col gap-2 rounded-xl border border-dashed p-3 sm:flex-row"
      >
        <Input
          name="title"
          placeholder="New section title…"
          required
          className="flex-1"
          aria-label="New section title"
        />
        <Button type="submit" variant="gradient" size="sm">
          <Plus className="size-4" /> Add section
        </Button>
      </form>
    </div>
  );
}
