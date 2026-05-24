"use client";

import type { FlashcardSettings, GameSettings } from "@/lib/types";

export interface ConfigureFlashcardsProps {
  settings: FlashcardSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureFlashcards({ settings, onChange }: ConfigureFlashcardsProps) {
  const update = (patch: Partial<FlashcardSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Card direction</label>
        <select
          value={settings.flipDirection}
          onChange={(e) =>
            update({
              flipDirection: e.target.value as FlashcardSettings["flipDirection"],
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="lyric-to-song">Lyric on front, song title on back</option>
          <option value="song-to-lyric">Song title on front, lyric on back</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Study mode</label>
        <select
          value={settings.studyMode}
          onChange={(e) =>
            update({ studyMode: e.target.value as FlashcardSettings["studyMode"] })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="sequential">Sequential</option>
          <option value="shuffle">Shuffled</option>
          <option value="spaced">Spaced (re-show what you&apos;re learning)</option>
        </select>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={settings.showHints}
          onChange={(e) => update({ showHints: e.target.checked })}
          className="w-5 h-5"
        />
        <span className="text-sm font-semibold">Show hints (first letters)</span>
      </label>
    </div>
  );
}
