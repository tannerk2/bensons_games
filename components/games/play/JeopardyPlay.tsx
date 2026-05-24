"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { recordGamePlayedAction } from "@/app/games/actions";
import type { Game, JeopardySettings } from "@/lib/types";

interface CellKey {
  catIdx: number;
  qIdx: number;
}

const TEAM_COLORS = ["#4A90D9", "#FF7B54", "#6BCB77", "#9B59B6"];

export interface JeopardyPlayProps {
  game: Game;
}

export function JeopardyPlay({ game }: JeopardyPlayProps) {
  const settings = game.settings as JeopardySettings;

  const [teams, setTeams] = useState(() => [
    { name: "Team Blue", score: 0 },
    { name: "Team Orange", score: 0 },
  ]);
  const [answeredKeys, setAnsweredKeys] = useState<Set<string>>(new Set());
  const [activeCell, setActiveCell] = useState<CellKey | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    void recordGamePlayedAction(game.id);
  }, [game.id]);

  const keyOf = (cat: number, q: number) => `${cat}-${q}`;

  const allAnswered =
    settings.categories.length > 0 &&
    settings.categories.every((cat, ci) =>
      cat.questions.every((_, qi) => answeredKeys.has(keyOf(ci, qi)))
    );

  const closeModal = () => {
    setActiveCell(null);
    setRevealed(false);
  };

  const award = (teamIdx: number) => {
    if (!activeCell) return;
    const points =
      settings.categories[activeCell.catIdx]?.questions[activeCell.qIdx]?.points ?? 0;
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, score: t.score + points } : t))
    );
    setAnsweredKeys((prev) =>
      new Set(prev).add(keyOf(activeCell.catIdx, activeCell.qIdx))
    );
    closeModal();
  };

  const noOne = () => {
    if (!activeCell) return;
    setAnsweredKeys((prev) =>
      new Set(prev).add(keyOf(activeCell.catIdx, activeCell.qIdx))
    );
    closeModal();
  };

  const setTeamName = (idx: number, name: string) =>
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name } : t)));

  const addTeam = () => {
    if (teams.length >= 4) return;
    setTeams((prev) => [...prev, { name: `Team ${prev.length + 1}`, score: 0 }]);
  };

  const removeTeam = (idx: number) => {
    if (teams.length <= 2) return;
    setTeams((prev) => prev.filter((_, i) => i !== idx));
  };

  const cell = activeCell
    ? settings.categories[activeCell.catIdx]?.questions[activeCell.qIdx]
    : null;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(180deg, #1a1a6e 0%, #0d0d4a 100%)",
      }}
    >
      <header className="bg-black/30 px-4 py-3 flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-widest text-game-yellow">
          {game.name.toUpperCase()}
        </h1>
        <div />
      </header>

      <main className="px-4 py-8 max-w-5xl mx-auto">
        {/* Teams */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {teams.map((team, ti) => (
            <div
              key={ti}
              className="rounded-2xl px-4 py-2 text-center min-w-[140px] relative"
              style={{
                background: `linear-gradient(135deg, ${TEAM_COLORS[ti]}, ${TEAM_COLORS[ti]}cc)`,
              }}
            >
              <input
                value={team.name}
                onChange={(e) => setTeamName(ti, e.target.value)}
                className="bg-transparent text-xs font-semibold text-center outline-none w-full mb-0.5"
              />
              <div className="font-extrabold text-2xl">{team.score}</div>
              {teams.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeTeam(ti)}
                  aria-label="Remove team"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/30 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {teams.length < 4 && (
            <button
              type="button"
              onClick={addTeam}
              className="rounded-2xl px-4 py-2 border-2 border-white/30 text-sm font-bold"
            >
              + Team
            </button>
          )}
        </div>

        {/* Board */}
        {settings.categories.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="font-bold mb-2">No categories defined</p>
            <p className="text-sm text-white/70">
              Edit this game and add at least one category with clues to play.
            </p>
          </div>
        ) : (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${settings.categories.length}, minmax(0, 1fr))`,
            }}
          >
            {settings.categories.map((cat, ci) => (
              <div
                key={ci}
                className="bg-[#0d0d4a] rounded-xl px-2 py-3 text-center font-bold uppercase tracking-wider text-xs sm:text-sm"
              >
                {cat.name}
              </div>
            ))}
            {DEFAULT_POINT_INDEXES.map((qi) =>
              settings.categories.map((cat, ci) => {
                const q = cat.questions[qi];
                const answered = answeredKeys.has(keyOf(ci, qi));
                if (!q) {
                  return <div key={`${ci}-${qi}`} />;
                }
                return (
                  <button
                    key={`${ci}-${qi}`}
                    type="button"
                    disabled={answered}
                    onClick={() => {
                      setActiveCell({ catIdx: ci, qIdx: qi });
                      setRevealed(false);
                    }}
                    className="rounded-xl px-2 py-6 sm:py-8 text-2xl sm:text-3xl font-extrabold text-game-yellow border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(180deg, #1a1a8e 0%, #0d0d6e 100%)",
                      borderColor: "#2a2a9e",
                    }}
                  >
                    ${q.points}
                  </button>
                );
              })
            )}
          </div>
        )}

        {allAnswered && settings.categories.length > 0 && (
          <div className="mt-8 bg-white/10 rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-extrabold text-game-yellow mb-3">
              Game Over
            </h2>
            <ol className="space-y-1">
              {teams
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((t) => (
                  <li key={t.name} className="font-bold">
                    {t.name}: {t.score}
                  </li>
                ))}
            </ol>
          </div>
        )}
      </main>

      {/* Clue modal */}
      {activeCell && cell && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d4a] border-4 border-[#2a2a9e] rounded-3xl max-w-2xl w-full p-8 text-center">
            <p className="text-game-yellow font-extrabold text-xl mb-1">
              ${cell.points}
            </p>
            <p className="text-white/60 text-sm mb-6">
              {settings.categories[activeCell.catIdx].name}
            </p>
            <p className="text-2xl font-bold mb-6 leading-relaxed">
              {cell.clue || "(no clue set)"}
            </p>

            {revealed ? (
              <>
                <p className="text-game-yellow text-xl font-bold mb-6">
                  {cell.answer || "(no answer set)"}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {teams.map((team, ti) => (
                    <button
                      key={ti}
                      type="button"
                      onClick={() => award(ti)}
                      className="px-4 py-2 rounded-xl font-bold"
                      style={{
                        background: TEAM_COLORS[ti],
                      }}
                    >
                      Award {team.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={noOne}
                    className="px-4 py-2 rounded-xl bg-white/15 font-bold"
                  >
                    No one got it
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="px-6 py-3 rounded-xl bg-game-yellow text-foreground font-extrabold"
              >
                Reveal Answer
              </button>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
              style={{ position: "fixed" }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_POINT_INDEXES = [0, 1, 2, 3, 4];
