"use client";

import * as React from "react";
import { GripVertical, Pencil, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Curriculum section header with inline rename and delete. Deleting a section
 * removes all of its lessons (DB cascade), so it confirms first.
 */
export function SectionHeader({
  index,
  title,
  lessonCount,
  updateAction,
  deleteAction,
}: {
  index: number;
  title: string;
  lessonCount: number;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: () => void | Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);

  if (editing) {
    return (
      <form
        action={updateAction}
        onSubmit={() => setEditing(false)}
        className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Section {index}
        </span>
        <Input
          name="title"
          defaultValue={title}
          required
          autoFocus
          className="h-8 flex-1"
          aria-label="Section title"
        />
        <Button type="submit" variant="gradient" size="sm">
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(false)}
        >
          <X className="size-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
      <GripVertical className="size-4 text-muted-foreground" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Section {index}
      </span>
      <h3 className="font-medium">{title}</h3>
      <span className="ml-auto text-xs text-muted-foreground">
        {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Rename ${title}`}
      >
        <Pencil className="size-4" />
      </button>
      <form action={deleteAction}>
        <button
          type="submit"
          onClick={(e) => {
            if (
              !confirm(
                `Delete section "${title}" and all its lessons? This can't be undone.`,
              )
            ) {
              e.preventDefault();
            }
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="size-4" />
        </button>
      </form>
    </div>
  );
}
