"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lightbulb, RotateCcw } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import { shuffle, songLinePairs } from "@/lib/song-utils";
import { PlayHeader } from "./PlayHeader";
import type { FlashcardSettings, Game, Song } from "@/lib/types";

interface Card {
  id: string;
  front: string;
  back: string;
  status: "new" | "know" | "learning";
}

function buildDeck(songs: Song[], settings: FlashcardSettings): Card[] {
  const pool = songLinePairs(songs);
  const cards: Card[] = pool.map(({ song, line }, idx) => {
    const front =
      settings.flipDirection === "lyric-to-song" ? line : song.title;
    const back = settings.flipDirection === "lyric-to-song" ? song.title : line;
    return { id: `card-${idx}`, front, back, status: "new" };
  });
  return settings.studyMode === "shuffle" ? shuffle(cards) : cards;
}

export interface FlashcardsPlayProps {
  game: Game;
  songs: Song[];
}

export function FlashcardsPlay({ game, songs }: FlashcardsPlayProps) {
  const settings = game.settings as FlashcardSettings;

  const [deck, setDeck] = useState<Card[]>(() => buildDeck(songs, settings));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [knowCount, setKnowCount] = useState(0);
  const [learnCount, setLearnCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  const total = deck.length;
  const current = deck[index];

  const advance = (next: "know" | "learning") => {
    if (!current) return;
    if (next === "know") setKnowCount((n) => n + 1);
    else setLearnCount((n) => n + 1);

    let nextDeck = deck.slice();
    nextDeck[index] = { ...current, status: next };

    let nextIndex = index + 1;
    if (
      settings.studyMode === "spaced" &&
      next === "learning" &&
      index < nextDeck.length - 1
    ) {
      const card = nextDeck[index];
      nextDeck = [
        ...nextDeck.slice(0, index),
        ...nextDeck.slice(index + 1),
        card,
      ];
      // After splice the index pointer should stay (next card now lives here).
      nextIndex = index;
    }

    setDeck(nextDeck);
    setFlipped(false);
    setHintShown(false);

    if (nextIndex >= nextDeck.length) {
      setDone(true);
    } else {
      setIndex(nextIndex);
    }
  };

  const reset = () => {
    setDeck(buildDeck(songs, settings));
    setIndex(0);
    setFlipped(false);
    setHintShown(false);
    setKnowCount(0);
    setLearnCount(0);
    setDone(false);
  };

  const hint = useMemo(() => {
    if (!current) return "";
    return current.back
      .split(/\s+/)
      .map((w) => (w.length > 1 ? `${w[0]}${"_".repeat(w.length - 1)}` : w))
      .join(" ");
  }, [current]);

  if (total === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <h1 className="text-2xl font-extrabold mb-2">No cards available</h1>
        <p className="text-muted-foreground mb-6">
          Add some lyrics to your songs to generate cards.
        </p>
        <Link
          href="/games"
          className="px-5 py-3 rounded-xl bg-card border-2 border-border font-bold"
        >
          Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh]">
      <PlayHeader
        title="Flashcards"
        subtitle={game.name}
        accentColorClass="text-game-purple"
        badge={
          <span className="bg-game-purple/15 text-game-purple px-3 py-1 rounded-full text-sm font-semibold">
            {Math.min(index + 1, total)} / {total}
          </span>
        }
      />

      <main className="px-4 py-8 max-w-xl mx-auto">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 text-center bg-game-green/10">
            <div className="text-3xl font-extrabold text-game-green">
              {knowCount}
            </div>
            <div className="text-xs font-semibold text-game-green">Know it</div>
          </div>
          <div className="rounded-2xl p-4 text-center bg-game-coral/10">
            <div className="text-3xl font-extrabold text-game-coral">
              {learnCount}
            </div>
            <div className="text-xs font-semibold text-game-coral">Learning</div>
          </div>
        </div>

        {!done && current && (
          <>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={`w-full rounded-3xl p-10 sm:p-12 shadow-soft text-center min-h-[240px] flex flex-col items-center justify-center transition-colors border-4 ${
                flipped
                  ? "bg-game-purple text-white border-transparent"
                  : "bg-card border-game-purple"
              }`}
            >
              <div
                className={`text-xs uppercase tracking-widest font-bold mb-4 ${
                  flipped ? "text-white/80" : "text-game-purple"
                }`}
              >
                {flipped ? "Answer" : "Card"}
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold leading-snug ${
                  flipped ? "" : "italic"
                }`}
              >
                {flipped
                  ? current.back
                  : hintShown
                  ? `${current.front}\n${hint}`
                  : current.front}
              </div>
              {!flipped && (
                <p className="mt-6 text-sm text-muted-foreground">
                  Tap to reveal
                </p>
              )}
            </button>

            <div className="mt-6 flex flex-col gap-3">
              {settings.showHints && !flipped && !hintShown && (
                <button
                  type="button"
                  onClick={() => setHintShown(true)}
                  className="self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
                >
                  <Lightbulb className="w-4 h-4" /> Show hint
                </button>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => advance("learning")}
                  className="flex-1 px-5 py-4 rounded-2xl border-4 border-game-coral bg-card text-game-coral font-extrabold"
                >
                  Still Learning
                </button>
                <button
                  type="button"
                  onClick={() => advance("know")}
                  className="flex-1 px-5 py-4 rounded-2xl bg-game-green text-white font-extrabold shadow-soft"
                >
                  Know It!
                </button>
              </div>
            </div>
          </>
        )}

        {done && (
          <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Session complete</h2>
            <p className="text-muted-foreground mb-6">
              {knowCount} known · {learnCount} still learning
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
              >
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
              <Link
                href="/games"
                className="px-5 py-3 rounded-xl bg-card border-2 border-border font-bold"
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
