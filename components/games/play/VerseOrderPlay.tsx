"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GripVertical, RotateCcw } from "lucide-react";
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
import { recordGamePlayedAction } from "@/app/games/actions";
import { derangement, shuffle } from "@/lib/song-utils";
import { PlayHeader } from "./PlayHeader";
import type { Game, Song, VerseOrderSettings } from "@/lib/types";

interface Item {
  id: string;
  text: string;
  /** Original index (correct order). */
  correctIndex: number;
}

function buildItems(songs: Song[], settings: VerseOrderSettings): Item[] {
  // Use the first song's verses (or lines) as the base puzzle.
  const song = songs[0];
  if (!song) return [];

  let strings: string[];
  if (settings.granularity === "verses") {
    strings = song.verses.map((v) =>
      v.lines.length > 0
        ? `${v.title ? `${v.title}: ` : ""}${v.lines.join(" / ")}`
        : v.title ?? ""
    );
  } else {
    strings = song.verses.flatMap((v) => v.lines);
  }
  strings = strings.filter((s) => s.trim().length > 0);

  const ordered: Item[] = strings.map((text, i) => ({
    id: `item-${i}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    correctIndex: i,
  }));

  if (settings.scrambleLevel === "light") {
    return derangement(ordered, (a, b) => a.correctIndex === b.correctIndex);
  }
  return shuffle(ordered);
}

export interface VerseOrderPlayProps {
  game: Game;
  songs: Song[];
}

export function VerseOrderPlay({ game, songs }: VerseOrderPlayProps) {
  const settings = game.settings as VerseOrderSettings;

  const [round, setRound] = useState(0);
  const initial = useMemo(
    () => buildItems(songs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [songs, settings, round]
  );
  const [items, setItems] = useState<Item[]>(initial);
  const [checked, setChecked] = useState(false);
  const total = initial.length;

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  // Reset internal state whenever a new round starts.
  useEffect(() => {
    setItems(initial);
    setChecked(false);
  }, [initial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === active.id);
      const to = prev.findIndex((i) => i.id === over.id);
      if (from === -1 || to === -1) return prev;
      return arrayMove(prev, from, to);
    });
    setChecked(false);
  };

  const correctCount = items.filter((it, idx) => it.correctIndex === idx).length;
  const allCorrect = correctCount === total;

  return (
    <div className="min-h-[80vh]">
      <PlayHeader
        title="Verse Order"
        subtitle={game.name}
        accentColorClass="text-game-yellow"
        badge={
          <span className="bg-game-yellow/30 text-foreground px-3 py-1 rounded-full text-sm font-semibold">
            {checked ? `${correctCount} / ${total}` : `${total} items`}
          </span>
        }
      />

      <main className="px-4 py-8 max-w-2xl mx-auto">
        <p className="text-center text-muted-foreground mb-6">
          Drag the {settings.granularity} into the correct order.
        </p>

        {total === 0 ? (
          <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
            <p className="font-bold mb-2">Nothing to sort</p>
            <p className="text-sm text-muted-foreground">
              Add lyrics to your song and try again.
            </p>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      checked={checked}
                      isCorrect={checked && item.correctIndex === idx}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-card border-2 border-border font-bold"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                type="button"
                onClick={() => setChecked(true)}
                className="px-5 py-3 rounded-xl bg-game-yellow text-foreground font-bold shadow-soft"
              >
                Check Order
              </button>
            </div>

            {checked && allCorrect && (
              <div className="mt-6 bg-game-green/15 border-2 border-game-green/30 rounded-2xl p-4 text-center text-game-green font-bold">
                All in order!
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SortableRow({
  item,
  checked,
  isCorrect,
}: {
  item: Item;
  checked: boolean;
  isCorrect: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  let stateClass = "bg-card border-border";
  if (checked) {
    stateClass = isCorrect
      ? "bg-game-green/15 border-game-green"
      : "bg-game-coral/10 border-game-coral";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${stateClass}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag"
        className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-grab"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-base italic">&ldquo;{item.text}&rdquo;</span>
    </div>
  );
}
