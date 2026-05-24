"use client";

import { Plus, Trash2 } from "lucide-react";
import type { GameSettings, JeopardySettings, Song } from "@/lib/types";

const DEFAULT_POINTS = [100, 200, 300, 400, 500];

export interface ConfigureJeopardyProps {
  songs: Song[];
  settings: JeopardySettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureJeopardy({ songs, settings, onChange }: ConfigureJeopardyProps) {
  const update = (next: JeopardySettings) => onChange(next);

  const addCategory = () => {
    const song = songs[settings.categories.length] ?? songs[0];
    update({
      ...settings,
      categories: [
        ...settings.categories,
        {
          name: song?.title ?? `Category ${settings.categories.length + 1}`,
          questions: DEFAULT_POINTS.map((points) => ({
            points,
            clue: "",
            answer: "",
            songId: song?.id,
          })),
        },
      ],
    });
  };

  const removeCategory = (idx: number) => {
    update({
      ...settings,
      categories: settings.categories.filter((_, i) => i !== idx),
    });
  };

  const updateCategory = (idx: number, name: string) => {
    const next = settings.categories.slice();
    next[idx] = { ...next[idx], name };
    update({ ...settings, categories: next });
  };

  const updateQuestion = (
    catIdx: number,
    qIdx: number,
    patch: Partial<JeopardySettings["categories"][number]["questions"][number]>
  ) => {
    const next = settings.categories.map((cat, i) => {
      if (i !== catIdx) return cat;
      const questions = cat.questions.map((q, j) =>
        j === qIdx ? { ...q, ...patch } : q
      );
      return { ...cat, questions };
    });
    update({ ...settings, categories: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Add categories (typically one per song). Each category gets five
        clue/answer pairs at increasing point values.
      </p>

      <div className="flex flex-col gap-4">
        {settings.categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-muted rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={cat.name}
                onChange={(e) => updateCategory(catIdx, e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2 rounded-lg bg-card border-2 border-border outline-none focus:border-primary text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => removeCategory(catIdx)}
                aria-label="Remove category"
                className="p-2 rounded-lg text-game-coral hover:bg-game-coral/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {cat.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-card rounded-xl p-3 grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr] gap-2 items-start"
                >
                  <span className="text-sm font-bold text-primary self-center">
                    ${q.points}
                  </span>
                  <input
                    value={q.clue}
                    onChange={(e) =>
                      updateQuestion(catIdx, qIdx, { clue: e.target.value })
                    }
                    placeholder="Clue"
                    className="px-2 py-1.5 rounded-lg border-2 border-border outline-none focus:border-primary text-sm"
                  />
                  <input
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(catIdx, qIdx, { answer: e.target.value })
                    }
                    placeholder="Answer"
                    className="px-2 py-1.5 rounded-lg border-2 border-border outline-none focus:border-primary text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCategory}
        className="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
      >
        <Plus className="w-4 h-4" /> Add Category
      </button>
    </div>
  );
}
