"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import type {
  Game,
  MemoryMatchPair,
  MemoryMatchSettings,
  Song,
  SongVerse,
} from "@/lib/types";

interface Card {
  /** Unique within the deck. */
  id: string;
  /** Two cards with the same pairId form a match. */
  pairId: number;
  type: "image" | "text";
  url?: string;
  text?: string;
  position?: { x: number; y: number };
}

const GRID_LAYOUTS: Record<number, { cols: number; rows: number }> = {
  8: { cols: 4, rows: 2 },
  12: { cols: 4, rows: 3 },
  16: { cols: 4, rows: 4 },
  20: { cols: 5, rows: 4 },
  24: { cols: 6, rows: 4 },
};

function gridLayout(pairCount: number) {
  const total = pairCount * 2;
  return (
    GRID_LAYOUTS[total] ?? {
      cols: Math.ceil(Math.sqrt(total)),
      rows: Math.ceil(total / Math.ceil(Math.sqrt(total))),
    }
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function flatLines(verses: SongVerse[]): string[] {
  return verses.flatMap((v) => v.lines);
}

/**
 * Generate `pairCount` content pairs from the configured contentType.
 * Returns an array of single-pair card pairs (length pairCount), each pair
 * representing the two matching cards' shared content.
 */
function generatePairs(
  pairCount: number,
  contentType: MemoryMatchSettings["contentType"],
  pairs: MemoryMatchPair[] | undefined,
  songs: Song[]
): Array<{ a: Omit<Card, "id" | "pairId">; b: Omit<Card, "id" | "pairId"> }> {
  if (contentType === "image-text" && pairs && pairs.length >= pairCount) {
    return pairs.slice(0, pairCount).map((p) => {
      const card =
        p.type === "image"
          ? { type: "image" as const, url: p.url, position: p.position }
          : { type: "text" as const, text: p.text };
      return { a: card, b: card };
    });
  }

  // lyric-lyric: pick `pairCount` lines, each pair is the same line on both cards.
  if (contentType === "lyric-lyric") {
    const pool = shuffle(songs.flatMap((s) => flatLines(s.verses)));
    const picked = pool.slice(0, pairCount);
    return picked.map((line) => ({
      a: { type: "text" as const, text: line },
      b: { type: "text" as const, text: line },
    }));
  }

  // song-verse: each pair is a song title <-> a verse line from that song.
  if (contentType === "song-verse") {
    const pool: Array<{ title: string; line: string }> = songs.flatMap((s) =>
      flatLines(s.verses).map((line) => ({ title: s.title, line }))
    );
    const picked = shuffle(pool).slice(0, pairCount);
    return picked.map(({ title, line }) => ({
      a: { type: "text" as const, text: title },
      b: { type: "text" as const, text: line },
    }));
  }

  // Fallback: empty placeholders.
  return Array.from({ length: pairCount }, () => ({
    a: { type: "text" as const, text: "?" },
    b: { type: "text" as const, text: "?" },
  }));
}

function buildDeck(
  pairCount: number,
  contentType: MemoryMatchSettings["contentType"],
  pairs: MemoryMatchPair[] | undefined,
  songs: Song[]
): Card[] {
  const generated = generatePairs(pairCount, contentType, pairs, songs);
  const deck: Card[] = [];
  generated.forEach((pair, idx) => {
    deck.push({
      id: `${idx}-a-${Math.random().toString(36).slice(2, 8)}`,
      pairId: idx,
      ...pair.a,
    });
    deck.push({
      id: `${idx}-b-${Math.random().toString(36).slice(2, 8)}`,
      pairId: idx,
      ...pair.b,
    });
  });
  return shuffle(deck);
}

export interface MemoryMatchPlayProps {
  game: Game;
  songs: Song[];
}

export function MemoryMatchPlay({ game, songs }: MemoryMatchPlayProps) {
  const settings = game.settings as MemoryMatchSettings;

  const [deck, setDeck] = useState<Card[]>(() =>
    buildDeck(settings.pairCount, settings.contentType, settings.pairs, songs)
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);

  // Record play once on mount.
  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  // Timer.
  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  const layout = useMemo(() => gridLayout(settings.pairCount), [settings.pairCount]);

  const reset = useCallback(() => {
    setDeck(buildDeck(settings.pairCount, settings.contentType, settings.pairs, songs));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setRunning(false);
    setWon(false);
  }, [settings.pairCount, settings.contentType, settings.pairs, songs]);

  const handleClick = (card: Card) => {
    if (won) return;
    if (flipped.length === 2) return;
    if (flipped.includes(card.id)) return;
    if (matched.has(card.id)) return;

    if (!running) setRunning(true);
    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [aId, bId] = next;
      const a = deck.find((c) => c.id === aId)!;
      const b = deck.find((c) => c.id === bId)!;
      if (a.pairId === b.pairId) {
        const newMatched = new Set(matched);
        newMatched.add(aId);
        newMatched.add(bId);
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.size === deck.length) {
          setWon(true);
          setRunning(false);
        }
      } else {
        setTimeout(() => setFlipped([]), 1200);
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const themeColor = settings.themeColor ?? "#4A90D9";

  return (
    <div className="px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </Link>
          <h1 className="text-xl font-extrabold">{game.name}</h1>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <Stat label="Moves" value={moves.toString()} />
          <Stat label="Time" value={formatTime(time)} />
          <Stat label="Pairs" value={`${matched.size / 2} / ${settings.pairCount}`} />
        </div>

        <div
          className="grid gap-3 sm:gap-4 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            maxWidth: `${Math.min(900, 120 * layout.cols)}px`,
          }}
        >
          {deck.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.has(card.id);
            const isMatched = matched.has(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleClick(card)}
                className={`relative aspect-square rounded-2xl shadow-soft transition-transform ${
                  isMatched ? "opacity-60" : ""
                }`}
                style={{
                  perspective: "800px",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl transition-transform duration-300"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Card back */}
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
                    style={{
                      background: themeColor,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    ♪
                  </div>
                  {/* Card face */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-card border-2 border-border overflow-hidden flex items-center justify-center p-2 text-center text-sm sm:text-base font-bold"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {card.type === "image" && card.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={
                          card.position
                            ? {
                                objectPosition: `${card.position.x}% ${card.position.y}%`,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <span className="line-clamp-3 leading-tight">
                        {card.text}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {won && (
          <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-3xl shadow-soft p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-game-yellow/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-game-yellow" />
              </div>
              <h2 className="text-3xl font-extrabold mb-2">You did it!</h2>
              <p className="text-muted-foreground mb-6">
                Completed &ldquo;{game.name}&rdquo;.
              </p>
              <div className="flex justify-center gap-6 mb-6">
                <Stat label="Moves" value={moves.toString()} />
                <Stat label="Time" value={formatTime(time)} />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={reset}
                  className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
                >
                  Play again
                </button>
                <Link
                  href="/games"
                  className="px-5 py-3 rounded-xl bg-card border-2 border-border font-bold"
                >
                  Back to Games
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}
