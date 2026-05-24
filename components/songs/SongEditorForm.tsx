"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createSongAction, updateSongAction } from "@/app/songs/actions";
import type { Song, SongVerse } from "@/lib/types";

type EditorVerse = SongVerse & { _id: string };

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const newVerse = (title?: string, lines: string[] = []): EditorVerse => ({
  _id: newId(),
  title,
  lines,
});

export interface SongEditorFormProps {
  song?: Song;
}

export function SongEditorForm({ song }: SongEditorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(song?.title ?? "");
  const [verses, setVerses] = useState<EditorVerse[]>(
    song
      ? song.verses.map((v) => ({ ...v, _id: newId() }))
      : [newVerse("Verse 1"), newVerse("Chorus")]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setVerses((prev) => {
      const from = prev.findIndex((v) => v._id === active.id);
      const to = prev.findIndex((v) => v._id === over.id);
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
  };

  const updateVerse = (id: string, patch: Partial<EditorVerse>) =>
    setVerses((prev) => prev.map((v) => (v._id === id ? { ...v, ...patch } : v)));

  const removeVerse = (id: string) =>
    setVerses((prev) => prev.filter((v) => v._id !== id));

  const addVerse = () =>
    setVerses((prev) => [
      ...prev,
      newVerse(`Verse ${prev.length + 1}`),
    ]);

  const handleSubmit = (formAction: "create" | "update") => () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    const sanitizedVerses: SongVerse[] = verses.map((v) => ({
      title: v.title?.trim() || undefined,
      lines: v.lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
    }));
    if (!sanitizedVerses.some((v) => v.lines.length > 0)) {
      setError("At least one verse must have lyrics");
      return;
    }

    const fd = new FormData();
    fd.set("title", trimmedTitle);
    fd.set("verses", JSON.stringify(sanitizedVerses));

    startTransition(async () => {
      try {
        if (formAction === "create") {
          const result = await createSongAction(null, fd);
          if (result && !result.ok) setError(result.error);
        } else if (song) {
          const result = await updateSongAction(song.id, null, fd);
          if (result && !result.ok) setError(result.error);
        }
      } catch (err) {
        // Server actions throw a special redirect "error" on success; ignore those.
        if (err instanceof Error && /NEXT_REDIRECT/.test(err.message ?? "")) return;
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  return (
    <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8">
      <div className="mb-5">
        <label htmlFor="title" className="block text-sm font-semibold mb-2">
          Song Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Amazing Grace"
          className="w-full px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-base"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Verses</span>
          <button
            type="button"
            onClick={addVerse}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-soft"
          >
            <Plus className="w-4 h-4" /> Add Verse
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={verses.map((v) => v._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {verses.map((verse) => (
                <VerseRow
                  key={verse._id}
                  verse={verse}
                  canRemove={verses.length > 1}
                  onChangeTitle={(t) => updateVerse(verse._id, { title: t })}
                  onChangeLines={(lines) => updateVerse(verse._id, { lines })}
                  onRemove={() => removeVerse(verse._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {error && (
        <p className="text-sm font-medium text-game-coral mb-4">{error}</p>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/songs")}
          className="px-5 py-3 rounded-xl bg-card border-2 border-border font-bold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit(song ? "update" : "create")}
          disabled={pending}
          className="px-6 py-3 rounded-xl bg-game-green text-white font-bold shadow-soft disabled:opacity-50"
        >
          {pending ? "Saving…" : song ? "Save Changes" : "Save Song"}
        </button>
      </div>
    </div>
  );
}

interface VerseRowProps {
  verse: EditorVerse;
  canRemove: boolean;
  onChangeTitle: (title: string) => void;
  onChangeLines: (lines: string[]) => void;
  onRemove: () => void;
}

function VerseRow({
  verse,
  canRemove,
  onChangeTitle,
  onChangeLines,
  onRemove,
}: VerseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: verse._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-muted rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Reorder verse"
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-card cursor-grab"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <input
          value={verse.title ?? ""}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Verse name"
          className="flex-1 px-3 py-1.5 rounded-lg bg-card border-2 border-border outline-none focus:border-primary text-sm font-semibold"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove verse"
            className="p-2 rounded-lg text-game-coral hover:bg-game-coral/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <textarea
        value={verse.lines.join("\n")}
        onChange={(e) => onChangeLines(e.target.value.split("\n"))}
        placeholder="Enter lyrics, one line per row..."
        rows={Math.max(4, verse.lines.length + 1)}
        className="w-full px-3 py-2 rounded-xl bg-card border-2 border-border outline-none focus:border-primary text-base resize-vertical font-sans"
      />
    </div>
  );
}
