"use client";

import type { BingoSettings, GameSettings } from "@/lib/types";

export interface ConfigureBingoProps {
  settings: BingoSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureBingo({ settings, onChange }: ConfigureBingoProps) {
  const update = (patch: Partial<BingoSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Card size</label>
        <select
          value={settings.cardSize}
          onChange={(e) =>
            update({ cardSize: Number(e.target.value) as BingoSettings["cardSize"] })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value={3}>3 × 3</option>
          <option value={4}>4 × 4</option>
          <option value={5}>5 × 5</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Card content</label>
        <select
          value={settings.contentType}
          onChange={(e) =>
            update({
              contentType: e.target.value as BingoSettings["contentType"],
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="lyrics">Lyric snippets</option>
          <option value="song-titles">Song titles</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={settings.freeSpace}
          onChange={(e) => update({ freeSpace: e.target.checked })}
          className="w-5 h-5"
        />
        <span className="text-sm font-semibold">
          Free space in center (only used on 3×3 and 5×5)
        </span>
      </label>
    </div>
  );
}
