import { Plus, Layers } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/env";
import {
  addSection,
  addLesson,
  updateLesson,
  deleteLesson,
  updateSection,
  deleteSection,
} from "../actions";
import { AddLessonForm } from "./add-lesson-form";
import { LessonRow } from "./lesson-row";
import { SectionHeader } from "./section-header";
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
          <SectionHeader
            index={i + 1}
            title={section.title}
            lessonCount={section.lessons.length}
            updateAction={updateSection.bind(null, courseId, section.id)}
            deleteAction={deleteSection.bind(null, courseId, section.id)}
          />

          {/* Lessons */}
          <ul className="divide-y">
            {section.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                sectionId={section.id}
                storageEnabled={integrations.supabase}
                updateAction={updateLesson.bind(null, courseId, lesson.id)}
                deleteAction={deleteLesson.bind(null, courseId, lesson.id)}
              />
            ))}
          </ul>

          {/* Add lesson (with video upload) */}
          <AddLessonForm
            action={addLesson.bind(null, courseId, section.id)}
            courseId={courseId}
            sectionId={section.id}
            sectionTitle={section.title}
            storageEnabled={integrations.supabase}
          />
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
