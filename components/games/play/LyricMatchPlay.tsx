"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, RotateCcw } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import {
  shuffle,
  songLinePairs,
  splitLineHalves,
} from "@/lib/song-utils";
import { PlayHeader } from "./PlayHeader";
import type { Game, LyricMatchSettings, Song } from "@/lib/types";

interface PairItem {
  pairId: number;
  text: string;
}

function buildPairs(
  songs: Song[],
  settings: LyricMatchSettings
): { left: PairItem[]; right: PairItem[]; total: number } {
  if (settings.matchType === "song-lyric") {
    const pool = songLinePairs(songs);
    const picked = shuffle(pool).slice(0, settings.pairCount);
    const lefts: PairItem[] = picked.map((p, i) => ({
      pairId: i,
      text: p.song.title,
    }));
    const rights: PairItem[] = picked.map((p, i) => ({
      pairId: i,
      text: p.line,
    }));
    return {
      left: shuffle(lefts),
      right: shuffle(rights),
      total: picked.length,
    };
  }

  // Default: line-halves
  const all = songs.flatMap((s) => s.verses.flatMap((v) => v.lines));
  const usable = all.filter((l) => l.split(/\s+/).filter(Boolean).length >= 2);
  const picked = shuffle(usable).slice(0, settings.pairCount);
  const lefts: PairItem[] = [];
  const rights: PairItem[] = [];
  picked.forEach((line, i) => {
    const [a, b] = splitLineHalves(line);
    lefts.push({ pairId: i, text: a });
    rights.push({ pairId: i, text: b });
  });
  return { left: shuffle(lefts), right: shuffle(rights), total: picked.length };
}

export interface LyricMatchPlayProps {
  game: Game;
  songs: Song[];
}

export function LyricMatchPlay({ game, songs }: LyricMatchPlayProps) {
  const settings = game.settings as LyricMatchSettings;

  const [round, setRound] = useState(0); // bump to reshuffle
  const data = useMemo(
    () => buildPairs(songs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [songs, settings, round]
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"none" | "wrong">("none");

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  // Reset internal state when the round changes.
  useEffect(() => {
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongAttempts(0);
    setFeedback("none");
  }, [round]);

  const won = matched.size === data.total && data.total > 0;

  const tryMatch = (rightPairId: number) => {
    if (selectedLeft === null) return;
    if (selectedLeft === rightPairId) {
      const next = new Set(matched);
      next.add(selectedLeft);
      setMatched(next);
      setSelectedLeft(null);
    } else {
      setFeedback("wrong");
      setWrongAttempts((n) => n + 1);
      setTimeout(() => {
        setSelectedLeft(null);
        setFeedback("none");
      }, 600);
    }
  };

  return (
    <div className="min-h-[80vh]">
      <PlayHeader
        title="Lyric Match"
        subtitle={game.name}
        accentColorClass="text-game-green"
        badge={
          <span className="bg-game-green/15 text-game-green px-3 py-1 rounded-full text-sm font-semibold">
            {matched.size} / {data.total}
          </span>
        }
      />

      <main className="px-4 py-8 max-w-3xl mx-auto">
        <p className="text-center text-muted-foreground mb-6">
          {settings.matchType === "song-lyric"
            ? "Match each song title to a lyric from that song."
            : "Match each line beginning to its ending."}
        </p>

        {data.total === 0 ? (
          <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
            <p className="font-bold mb-2">Not enough lyrics to play</p>
            <p className="text-sm text-muted-foreground">
              Add more verses to your songs and try again.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
                {settings.matchType === "song-lyric" ? "Song" : "Beginnings"}
              </h3>
              {data.left.map((item) => {
                const done = matched.has(item.pairId);
                const selected = selectedLeft === item.pairId;
                return (
                  <button
                    key={`left-${item.pairId}`}
                    type="button"
                    disabled={done}
                    onClick={() => setSelectedLeft(item.pairId)}
                    className={`text-left px-4 py-3 rounded-2xl border-2 font-semibold transition ${
                      done
                        ? "bg-game-green/15 border-game-green text-game-green line-through"
                        : selected
                        ? feedback === "wrong"
                          ? "bg-game-coral text-white border-game-coral"
                          : "bg-game-green text-white border-game-green"
                        : "bg-card border-border hover:border-game-green"
                    }`}
                  >
                    {item.text}
                    {settings.matchType === "line-halves" && !done && "…"}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
                {settings.matchType === "song-lyric" ? "Lyric" : "Endings"}
              </h3>
              {data.right.map((item) => {
                const done = matched.has(item.pairId);
                return (
                  <button
                    key={`right-${item.pairId}`}
                    type="button"
                    disabled={done || selectedLeft === null}
                    onClick={() => tryMatch(item.pairId)}
                    className={`text-left px-4 py-3 rounded-2xl border-2 font-semibold transition ${
                      done
                        ? "bg-game-green/15 border-game-green text-game-green line-through"
                        : selectedLeft === null
                        ? "bg-card border-border opacity-60"
                        : "bg-card border-border hover:border-game-green"
                    }`}
                  >
                    {settings.matchType === "line-halves" && !done && "…"}
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {won && (
          <div className="mt-8 bg-card rounded-3xl shadow-soft p-6 text-center">
            <Trophy className="w-10 h-10 text-game-yellow mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold mb-1">All matched!</h2>
            <p className="text-muted-foreground mb-4">
              {wrongAttempts} incorrect{" "}
              {wrongAttempts === 1 ? "attempt" : "attempts"}.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
              >
                <RotateCcw className="w-4 h-4" /> Play again
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
