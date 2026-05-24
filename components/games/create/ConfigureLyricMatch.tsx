"use client";

import type { GameSettings, LyricMatchSettings } from "@/lib/types";

export interface ConfigureLyricMatchProps {
  settings: LyricMatchSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureLyricMatch({ settings, onChange }: ConfigureLyricMatchProps) {
  const update = (patch: Partial<LyricMatchSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Pairs per round</label>
        <select
          value={settings.pairCount}
          onChange={(e) => update({ pairCount: Number(e.target.value) })}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          {[3, 4, 5, 6, 7, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n} pairs
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Match what?</label>
        <select
          value={settings.matchType}
          onChange={(e) =>
            update({ matchType: e.target.value as LyricMatchSettings["matchType"] })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="line-halves">Line beginnings to endings</option>
          <option value="song-lyric">Song titles to lyrics</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          {settings.matchType === "line-halves" &&
            "We split each line at its midpoint and you match the halves."}
          {settings.matchType === "song-lyric" &&
            "Match each song title to one of its lyric lines."}
        </p>
      </div>
    </div>
  );
}
