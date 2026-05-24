"use client";

import type { GameSettings, VerseOrderSettings } from "@/lib/types";

export interface ConfigureVerseOrderProps {
  settings: VerseOrderSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureVerseOrder({ settings, onChange }: ConfigureVerseOrderProps) {
  const update = (patch: Partial<VerseOrderSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Sort by</label>
        <select
          value={settings.granularity}
          onChange={(e) =>
            update({
              granularity: e.target.value as VerseOrderSettings["granularity"],
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="verses">Whole verses</option>
          <option value="lines">Individual lines</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Difficulty</label>
        <select
          value={settings.scrambleLevel}
          onChange={(e) =>
            update({
              scrambleLevel: e.target.value as VerseOrderSettings["scrambleLevel"],
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="light">Easy (small shuffle)</option>
          <option value="full">Hard (full shuffle)</option>
        </select>
      </div>
    </div>
  );
}
