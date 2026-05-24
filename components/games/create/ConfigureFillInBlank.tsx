"use client";

import type { FillInBlankSettings, GameSettings } from "@/lib/types";

export interface ConfigureFillInBlankProps {
  settings: FillInBlankSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureFillInBlank({ settings, onChange }: ConfigureFillInBlankProps) {
  const update = (patch: Partial<FillInBlankSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Difficulty</label>
        <select
          value={settings.difficulty}
          onChange={(e) =>
            update({
              difficulty: e.target.value as FillInBlankSettings["difficulty"],
              wordsToHide:
                e.target.value === "easy"
                  ? 20
                  : e.target.value === "hard"
                  ? 50
                  : 30,
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="easy">Easy (fewer blanks)</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard (more blanks)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Words to hide ({settings.wordsToHide}%)
        </label>
        <input
          type="range"
          min={10}
          max={70}
          step={5}
          value={settings.wordsToHide}
          onChange={(e) => update({ wordsToHide: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={settings.hintMode}
          onChange={(e) => update({ hintMode: e.target.checked })}
          className="w-5 h-5"
        />
        <span className="text-sm font-semibold">Allow hints</span>
      </label>
    </div>
  );
}
