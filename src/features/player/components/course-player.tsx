"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  FileType2,
  ListVideo,
  X,
  Check,
  Download,
  MessageSquare,
  ScrollText,
  Paperclip,
  StickyNote,
  Send,
} from "lucide-react";

import { cn, formatDuration, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "./video-player";
import { AiAssistant } from "./ai-assistant";
import { markLessonComplete, saveLessonNote } from "../actions";
import { demoComments } from "../demo-data";
import type {
  CoursePlayerData,
  LessonComment,
  PlayerLesson,
} from "../types";

type Tab = "notes" | "resources" | "transcript" | "comments";

interface SessionNote {
  id: string;
  body: string;
  at: string;
}

export function CoursePlayer({ data }: { data: CoursePlayerData }) {
  const allLessons = React.useMemo(
    () => data.sections.flatMap((s) => s.lessons),
    [data.sections],
  );

  const [currentId, setCurrentId] = React.useState(data.initialLessonId);
  const [completed, setCompleted] = React.useState<Set<string>>(
    () => new Set(data.completedLessonIds),
  );
  const [tab, setTab] = React.useState<Tab>("notes");
  const [curriculumOpen, setCurriculumOpen] = React.useState(false);

  // Per-session notes + comments (persist to DB when configured).
  const [notes, setNotes] = React.useState<SessionNote[]>([]);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [comments, setComments] = React.useState<LessonComment[]>(demoComments);
  const [commentDraft, setCommentDraft] = React.useState("");

  const currentIndex = allLessons.findIndex((l) => l.id === currentId);
  const lesson = allLessons[currentIndex] ?? allLessons[0];
  const prev = allLessons[currentIndex - 1];
  const next = allLessons[currentIndex + 1];

  const progressPct = Math.round((completed.size / allLessons.length) * 100);

  function select(id: string) {
    setCurrentId(id);
    setCurriculumOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function toggleComplete(id: string, value: boolean) {
    setCompleted((prevSet) => {
      const nextSet = new Set(prevSet);
      if (value) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
    // Persist (fire-and-forget; RLS-scoped, triggers the DB progress rollup).
    void markLessonComplete(data.course.id, id, value);
  }

  function handleEnded() {
    if (!completed.has(lesson.id)) toggleComplete(lesson.id, true);
    if (next) select(next.id); // auto-advance
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    const note = {
      id: crypto.randomUUID(),
      body: noteDraft.trim(),
      at: new Date().toISOString(),
    };
    setNotes((n) => [note, ...n]);
    void saveLessonNote(data.course.id, lesson.id, note.body);
    setNoteDraft("");
  }

  function addComment() {
    if (!commentDraft.trim()) return;
    setComments((c) => [
      {
        id: crypto.randomUUID(),
        authorName: "You",
        authorAvatar: null,
        body: commentDraft.trim(),
        at: new Date().toISOString(),
      },
      ...c,
    ]);
    setCommentDraft("");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/courses">
            <ChevronLeft className="size-4" /> My Courses
          </Link>
        </Button>
        <span className="truncate font-semibold">{data.course.title}</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Progress value={progressPct} className="w-28" />
            <span className="text-xs font-medium text-muted-foreground">
              {progressPct}%
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setCurriculumOpen(true)}
          >
            <ListVideo className="size-4" /> Contents
          </Button>
        </div>
      </header>

      <div className="flex-1 lg:grid lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="min-w-0 border-r">
          <div className="mx-auto max-w-4xl p-4 sm:p-6">
            {/* Lesson content */}
            <LessonContent lesson={lesson} onEnded={handleEnded} />

            {/* Title + complete */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {lesson.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(lesson.durationMinutes)} · Lesson{" "}
                  {currentIndex + 1} of {allLessons.length}
                </p>
              </div>
              <Button
                variant={completed.has(lesson.id) ? "outline" : "gradient"}
                onClick={() =>
                  toggleComplete(lesson.id, !completed.has(lesson.id))
                }
              >
                {completed.has(lesson.id) ? (
                  <>
                    <CheckCircle2 className="size-4" /> Completed
                  </>
                ) : (
                  <>
                    <Check className="size-4" /> Mark as complete
                  </>
                )}
              </Button>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b">
              <div className="flex gap-1 overflow-x-auto">
                <TabButton active={tab === "notes"} onClick={() => setTab("notes")} icon={<StickyNote className="size-4" />}>
                  Notes
                </TabButton>
                <TabButton active={tab === "resources"} onClick={() => setTab("resources")} icon={<Paperclip className="size-4" />}>
                  Resources{lesson.resources.length ? ` (${lesson.resources.length})` : ""}
                </TabButton>
                <TabButton active={tab === "transcript"} onClick={() => setTab("transcript")} icon={<ScrollText className="size-4" />}>
                  Transcript
                </TabButton>
                <TabButton active={tab === "comments"} onClick={() => setTab("comments")} icon={<MessageSquare className="size-4" />}>
                  Comments ({comments.length})
                </TabButton>
              </div>
            </div>

            <div className="py-6">
              {tab === "notes" && (
                <div>
                  <div className="flex gap-2">
                    <Textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Take a note for this lesson…"
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={addNote} variant="gradient" className="self-start">
                      Save
                    </Button>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {notes.length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        Your notes for this lesson will appear here.
                      </li>
                    )}
                    {notes.map((n) => (
                      <li
                        key={n.id}
                        className="rounded-lg border bg-card p-3 text-sm"
                      >
                        <p>{n.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(n.at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === "resources" && (
                <div>
                  {lesson.resources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No downloadable resources for this lesson.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {lesson.resources.map((r) => (
                        <li key={r.id}>
                          <a
                            href={r.url}
                            className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:border-primary/40"
                          >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Download className="size-4" />
                            </span>
                            <span className="flex-1 font-medium">{r.title}</span>
                            <span className="text-xs uppercase text-muted-foreground">
                              {r.kind}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === "transcript" && (
                <div className="prose-sm max-w-none text-sm leading-relaxed text-foreground/90">
                  {lesson.transcript ? (
                    lesson.transcript.split("\n").map((line, i) => (
                      <p key={i} className="mb-3">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No transcript available for this lesson.
                    </p>
                  )}
                </div>
              )}

              {tab === "comments" && (
                <div>
                  <div className="flex gap-2">
                    <Textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Ask a question or share a thought…"
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={addComment} variant="gradient" className="self-start">
                      <Send className="size-4" />
                    </Button>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {comments.map((c) => (
                      <li key={c.id} className="flex gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(c.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {c.authorName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90">{c.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between border-t pt-5">
              <Button
                variant="outline"
                disabled={!prev}
                onClick={() => prev && select(prev.id)}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <Button
                variant="gradient"
                disabled={!next}
                onClick={() => next && select(next.id)}
              >
                Next lesson <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Curriculum — desktop */}
        <aside className="hidden lg:block">
          <Curriculum
            data={data}
            currentId={currentId}
            completed={completed}
            onSelect={select}
          />
        </aside>
      </div>

      {/* Curriculum — mobile drawer */}
      {curriculumOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCurriculumOpen(false)}
          />
          <div className="absolute right-0 top-0 h-dvh w-80 max-w-[85vw] overflow-y-auto border-l bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-semibold">Course content</span>
              <button
                onClick={() => setCurriculumOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <Curriculum
              data={data}
              currentId={currentId}
              completed={completed}
              onSelect={select}
            />
          </div>
        </div>
      )}

      {/* Floating AI Study Assistant */}
      <AiAssistant courseTitle={data.course.title} lessonTitle={lesson.title} />
    </div>
  );
}

/* --------------------------- lesson content ------------------------------- */

function LessonContent({
  lesson,
  onEnded,
}: {
  lesson: PlayerLesson;
  onEnded: () => void;
}) {
  if (lesson.video) {
    return <VideoPlayer source={lesson.video} onEnded={onEnded} />;
  }

  if (lesson.type === "text" || lesson.type === "markdown") {
    return (
      <article className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="max-w-none space-y-4 leading-relaxed">
          {(lesson.body ?? "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    );
  }

  if (lesson.type === "pdf") {
    const hasUrl = lesson.body && lesson.body !== "#";
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl border bg-muted/30 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileType2 className="size-7" />
        </span>
        <p className="font-medium">PDF resource</p>
        <Button asChild variant="gradient" disabled={!hasUrl}>
          <a href={hasUrl ? lesson.body! : undefined} target="_blank" rel="noreferrer">
            <FileText className="size-4" /> Open PDF
          </a>
        </Button>
      </div>
    );
  }

  // embed / fallback
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-muted/30">
      <PlayCircle className="size-12 text-muted-foreground" />
    </div>
  );
}

/* ------------------------------ curriculum -------------------------------- */

function Curriculum({
  data,
  currentId,
  completed,
  onSelect,
}: {
  data: CoursePlayerData;
  currentId: string;
  completed: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="divide-y">
      {data.sections.map((section, si) => {
        const done = section.lessons.filter((l) => completed.has(l.id)).length;
        return (
          <div key={section.id}>
            <div className="bg-muted/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Section {si + 1}
              </p>
              <p className="font-medium">{section.title}</p>
              <p className="text-xs text-muted-foreground">
                {done}/{section.lessons.length} completed
              </p>
            </div>
            <ul>
              {section.lessons.map((l) => {
                const active = l.id === currentId;
                const isDone = completed.has(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(l.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors",
                        active ? "bg-primary/10" : "hover:bg-accent/5",
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate",
                            active && "font-medium text-primary",
                          )}
                        >
                          {l.title}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <LessonTypeIcon type={l.type} />
                          {formatDuration(l.durationMinutes)}
                          {l.isPreview && (
                            <Badge variant="accent" className="px-1.5 py-0 text-[10px]">
                              Preview
                            </Badge>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function LessonTypeIcon({ type }: { type: PlayerLesson["type"] }) {
  if (type === "text" || type === "markdown")
    return <FileText className="size-3" />;
  if (type === "pdf") return <FileType2 className="size-3" />;
  return <PlayCircle className="size-3" />;
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
