"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lightbulb, RotateCcw } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import { shuffle, songLinePairs } from "@/lib/song-utils";
import { PlayHeader } from "./PlayHeader";
import type { FillInBlankSettings, Game, Song } from "@/lib/types";

interface Question {
  id: string;
  songTitle: string;
  /** Words in order; tokens that are not blanks just stay as-is. */
  tokens: Array<{ word: string; punctuation: string }>;
  /** Indexes (in tokens) that are hidden. */
  blankIndexes: number[];
  /** Word bank for this question, including the answers shuffled with distractors. */
  bank: string[];
}

const cleanWord = (token: string): { word: string; punctuation: string } => {
  // Pull trailing punctuation aside so blanks don't include commas/periods.
  const match = token.match(/^([\w'’-]+)(.*)$/);
  if (!match) return { word: token, punctuation: "" };
  return { word: match[1], punctuation: match[2] };
};

function buildQuestions(
  songs: Song[],
  settings: FillInBlankSettings
): Question[] {
  const lines = songLinePairs(songs);
  if (lines.length === 0) return [];
  const sample = shuffle(lines).slice(0, 8);

  return sample.map(({ song, line }, idx) => {
    const tokens = line
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => cleanWord(t));

    const candidateIdx = tokens
      .map((t, i) => (t.word.length >= 3 ? i : -1))
      .filter((i) => i >= 0);

    const wantBlanks = Math.max(
      1,
      Math.round((settings.wordsToHide / 100) * candidateIdx.length)
    );
    const blankIndexes = shuffle(candidateIdx).slice(
      0,
      Math.min(wantBlanks, candidateIdx.length)
    );

    const answers = blankIndexes.map((i) => tokens[i].word);
    // Bank = answers + a couple of distractors from the same song.
    const otherWords = song.verses
      .flatMap((v) => v.lines.flatMap((l) => l.split(/\s+/).filter(Boolean)))
      .map((t) => cleanWord(t).word)
      .filter((w) => w.length >= 3 && !answers.includes(w));
    const distractors = shuffle(otherWords).slice(
      0,
      Math.min(3, otherWords.length)
    );
    const bank = shuffle([...answers, ...distractors]);

    return {
      id: `q-${idx}`,
      songTitle: song.title,
      tokens,
      blankIndexes,
      bank,
    };
  });
}

export interface FillInBlankPlayProps {
  game: Game;
  songs: Song[];
}

export function FillInBlankPlay({ game, songs }: FillInBlankPlayProps) {
  const settings = game.settings as FillInBlankSettings;

  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => buildQuestions(songs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [songs, settings, round]
  );

  const [qIdx, setQIdx] = useState(0);
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  useEffect(() => {
    setQIdx(0);
    setFilled({});
    setScore(0);
    setUsed(new Set());
    setDone(false);
    setHintShown(false);
  }, [round]);

  const total = questions.length;
  const current = questions[qIdx];

  const allBlanksFilled = current
    ? current.blankIndexes.every((bi) => filled[bi])
    : false;

  const submit = () => {
    if (!current) return;
    const correct = current.blankIndexes.every(
      (bi) =>
        (filled[bi] ?? "").toLowerCase().trim() ===
        current.tokens[bi].word.toLowerCase().trim()
    );
    if (correct) setScore((s) => s + 1);

    const next = qIdx + 1;
    if (next >= total) setDone(true);
    else {
      setQIdx(next);
      setFilled({});
      setUsed(new Set());
      setHintShown(false);
    }
  };

  const skip = submit; // skipping submits whatever's in place (likely wrong)

  const tapWord = (word: string) => {
    if (!current) return;
    if (used.has(word)) return;
    const blank = current.blankIndexes.find((bi) => !filled[bi]);
    if (blank === undefined) return;
    setFilled((prev) => ({ ...prev, [blank]: word }));
    setUsed((prev) => new Set(prev).add(word));
  };

  const clearLast = () => {
    if (!current) return;
    const filledBlanks = current.blankIndexes.filter((bi) => filled[bi]);
    const last = filledBlanks[filledBlanks.length - 1];
    if (last === undefined) return;
    const word = filled[last];
    setFilled((prev) => {
      const copy = { ...prev };
      delete copy[last];
      return copy;
    });
    if (word)
      setUsed((prev) => {
        const copy = new Set(prev);
        copy.delete(word);
        return copy;
      });
  };

  const reset = () => setRound((r) => r + 1);

  if (total === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <h1 className="text-2xl font-extrabold mb-2">No lyrics to fill</h1>
        <p className="text-muted-foreground mb-6">
          Add a verse with multiple words and try again.
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
        title="Fill in the Blank"
        subtitle={`${game.name} — ${current?.songTitle ?? ""}`}
        accentColorClass="text-game-coral"
        badge={
          <span className="bg-game-coral/15 text-game-coral px-3 py-1 rounded-full text-sm font-semibold">
            {Math.min(qIdx + 1, total)} / {total}
          </span>
        }
      />

      <main className="px-4 py-8 max-w-2xl mx-auto">
        {!done && current && (
          <>
            <div className="bg-card rounded-3xl shadow-soft border-4 border-game-coral/30 p-6 sm:p-10 mb-6">
              <p className="text-xl sm:text-2xl leading-relaxed text-center">
                {current.tokens.map((tok, i) => {
                  if (current.blankIndexes.includes(i)) {
                    const filledWord = filled[i];
                    return (
                      <span key={i}>
                        <span
                          className={`inline-block px-3 py-0.5 mx-1 rounded-lg border-b-2 ${
                            filledWord
                              ? "bg-game-coral text-white border-game-coral"
                              : "bg-game-coral/10 text-game-coral border-game-coral"
                          }`}
                        >
                          {filledWord ?? "____"}
                        </span>
                        {tok.punctuation}{" "}
                      </span>
                    );
                  }
                  return (
                    <span key={i}>
                      {tok.word}
                      {tok.punctuation}{" "}
                    </span>
                  );
                })}
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-3">
              Tap a word to fill the next blank.
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {current.bank.map((word) => {
                const isUsed = used.has(word);
                return (
                  <button
                    key={word}
                    type="button"
                    onClick={() => tapWord(word)}
                    disabled={isUsed}
                    className={`px-4 py-2 rounded-xl border-2 font-bold ${
                      isUsed
                        ? "bg-muted text-muted-foreground border-border line-through"
                        : "bg-card border-border hover:border-game-coral"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              {settings.hintMode && !hintShown && (
                <button
                  type="button"
                  onClick={() => setHintShown(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
                >
                  <Lightbulb className="w-4 h-4" /> Hint
                </button>
              )}
              <button
                type="button"
                onClick={clearLast}
                className="px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={skip}
                className="px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!allBlanksFilled}
                className="px-5 py-2.5 rounded-xl bg-game-coral text-white font-bold shadow-soft disabled:opacity-50"
              >
                Submit
              </button>
            </div>

            {hintShown && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {current.blankIndexes
                  .map((bi, i) => `${i + 1}: ${current.tokens[bi].word[0]}…`)
                  .join("    ")}
              </p>
            )}
          </>
        )}

        {done && (
          <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Done!</h2>
            <p className="text-muted-foreground mb-6">
              {score} / {total} correct
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={reset}
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
