"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import { shuffle } from "@/lib/song-utils";
import { PlayHeader } from "./PlayHeader";
import type { BingoSettings, Game, Song } from "@/lib/types";

interface Cell {
  text: string;
  free: boolean;
}

function pickPool(songs: Song[], settings: BingoSettings): string[] {
  const titles = songs.map((s) => s.title);
  const lines = songs.flatMap((s) =>
    s.verses.flatMap((v) => v.lines.flatMap((l) => l.split(/\s+/)))
  );
  const cleanLines = Array.from(
    new Set(
      lines
        .map((w) => w.replace(/[.,!?;:'"’]/g, ""))
        .filter((w) => w.length >= 3)
    )
  );

  if (settings.contentType === "song-titles") return titles;
  if (settings.contentType === "lyrics") return cleanLines;
  return [...cleanLines, ...titles];
}

function buildCard(songs: Song[], settings: BingoSettings): Cell[] {
  const total = settings.cardSize * settings.cardSize;
  const useFree =
    settings.freeSpace && settings.cardSize % 2 === 1; // 3 or 5
  const need = useFree ? total - 1 : total;
  const pool = pickPool(songs, settings);
  const picked = shuffle(pool).slice(0, need);

  // Pad with placeholders if pool too small.
  while (picked.length < need) picked.push("HYMN");

  const cells: Cell[] = picked.map((text) => ({ text, free: false }));
  if (useFree) {
    const center = Math.floor(total / 2);
    cells.splice(center, 0, { text: "FREE", free: true });
  }
  return cells;
}

function checkWin(marked: Set<number>, size: number): boolean {
  const won = (idxs: number[]) => idxs.every((i) => marked.has(i));
  // Rows
  for (let r = 0; r < size; r++) {
    const row = Array.from({ length: size }, (_, c) => r * size + c);
    if (won(row)) return true;
  }
  // Columns
  for (let c = 0; c < size; c++) {
    const col = Array.from({ length: size }, (_, r) => r * size + c);
    if (won(col)) return true;
  }
  // Diagonals
  const d1 = Array.from({ length: size }, (_, i) => i * size + i);
  const d2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
  return won(d1) || won(d2);
}

export interface BingoPlayProps {
  game: Game;
  songs: Song[];
}

export function BingoPlay({ game, songs }: BingoPlayProps) {
  const settings = game.settings as BingoSettings;
  const [round, setRound] = useState(0);

  const card = useMemo(
    () => buildCard(songs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [songs, settings, round]
  );

  const [marked, setMarked] = useState<Set<number>>(() => {
    const init = new Set<number>();
    card.forEach((c, i) => c.free && init.add(i));
    return init;
  });

  // Reset when card changes.
  useEffect(() => {
    const init = new Set<number>();
    card.forEach((c, i) => c.free && init.add(i));
    setMarked(init);
  }, [card]);

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  const won = checkWin(marked, settings.cardSize);

  const toggle = (idx: number) => {
    if (card[idx].free) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-[80vh]">
      <PlayHeader
        title="Hymn Bingo"
        subtitle={game.name}
        accentColorClass="text-game-pink"
        badge={
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="px-3 py-1.5 rounded-lg bg-game-pink text-white font-bold text-sm shadow-soft"
          >
            New Card
          </button>
        }
      />

      <main className="px-4 py-8 max-w-md mx-auto">
        <div className="bg-card rounded-3xl shadow-soft p-3 sm:p-4">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${settings.cardSize}, minmax(0, 1fr))`,
            }}
          >
            {card.map((cell, idx) => {
              const isMarked = marked.has(idx);
              const isFree = cell.free;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggle(idx)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-center text-xs sm:text-sm font-bold transition p-1 ${
                    isFree
                      ? "bg-game-yellow text-foreground"
                      : isMarked
                      ? "bg-game-pink text-white"
                      : "bg-muted hover:bg-muted/70 text-foreground"
                  }`}
                >
                  <span className="line-clamp-3 leading-tight">{cell.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {won && (
          <div className="mt-6 bg-game-pink text-white rounded-2xl p-6 text-center shadow-soft">
            <Sparkles className="w-10 h-10 mx-auto mb-2" />
            <h2 className="text-3xl font-extrabold">BINGO!</h2>
            <p className="text-white/80 mb-4">You completed a line.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className="px-5 py-3 rounded-xl bg-white text-game-pink font-bold"
              >
                New Card
              </button>
              <Link
                href="/games"
                className="px-5 py-3 rounded-xl border-2 border-white text-white font-bold"
              >
                Back to Games
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
