"use client";

import { useReducer, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressSteps } from "@/components/ui";
import { GAME_TYPES, GAME_TYPE_LIST, accentClasses } from "@/lib/game-types";
import { createGameAction, updateGameAction } from "@/app/games/actions";
import type {
  Game,
  GameSettings,
  GameType,
  Song,
} from "@/lib/types";
import { ConfigureMemoryMatch } from "./ConfigureMemoryMatch";
import { ConfigureFlashcards } from "./ConfigureFlashcards";
import { ConfigureLyricMatch } from "./ConfigureLyricMatch";
import { ConfigureVerseOrder } from "./ConfigureVerseOrder";
import { ConfigureFillInBlank } from "./ConfigureFillInBlank";
import { ConfigureBingo } from "./ConfigureBingo";
import { ConfigureJeopardy } from "./ConfigureJeopardy";

type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  type: GameType | null;
  songIds: string[];
  name: string;
  settings: GameSettings | null;
}

type Action =
  | { kind: "set-step"; step: WizardStep }
  | { kind: "set-type"; type: GameType }
  | { kind: "toggle-song"; songId: string }
  | { kind: "set-songs"; songIds: string[] }
  | { kind: "set-name"; name: string }
  | { kind: "set-settings"; settings: GameSettings };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.kind) {
    case "set-step":
      return { ...state, step: action.step };
    case "set-type": {
      const info = GAME_TYPES[action.type];
      return {
        ...state,
        type: action.type,
        settings: info.defaultSettings(),
        step: 2,
      };
    }
    case "toggle-song": {
      const exists = state.songIds.includes(action.songId);
      return {
        ...state,
        songIds: exists
          ? state.songIds.filter((id) => id !== action.songId)
          : [...state.songIds, action.songId],
      };
    }
    case "set-songs":
      return { ...state, songIds: action.songIds };
    case "set-name":
      return { ...state, name: action.name };
    case "set-settings":
      return { ...state, settings: action.settings };
  }
}

export interface CreateGameWizardProps {
  songs: Song[];
  /** Pre-select these song ids (via ?songId= query). */
  preselectedSongIds?: string[];
  /** When provided, the wizard re-opens at step 3 to edit an existing game. */
  editingGame?: Game;
}

export function CreateGameWizard({
  songs,
  preselectedSongIds = [],
  editingGame,
}: CreateGameWizardProps) {
  const initial: WizardState = editingGame
    ? {
        step: 3,
        type: editingGame.gameType,
        songIds: editingGame.songIds,
        name: editingGame.name,
        settings: editingGame.settings,
      }
    : {
        step: 1,
        type: null,
        songIds: preselectedSongIds,
        name: "",
        settings: null,
      };

  const [state, dispatch] = useReducer(reducer, initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const goBack = () => {
    if (state.step === 1) return;
    dispatch({ kind: "set-step", step: (state.step - 1) as WizardStep });
    setError(null);
  };

  const goNext = () => {
    if (state.step >= 3) return;
    dispatch({ kind: "set-step", step: (state.step + 1) as WizardStep });
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    if (!state.type || !state.settings) {
      setError("Please choose a game type first");
      return;
    }
    if (!state.name.trim()) {
      setError("Game name is required");
      return;
    }

    const fd = new FormData();
    fd.set("gameType", state.type);
    fd.set("name", state.name.trim());
    fd.set("songIds", JSON.stringify(state.songIds));
    fd.set("settings", JSON.stringify(state.settings));

    startTransition(async () => {
      try {
        const result = editingGame
          ? await updateGameAction(editingGame.id, null, fd)
          : await createGameAction(null, fd);
        if (result && !result.ok) setError(result.error);
      } catch (err) {
        if (err instanceof Error && /NEXT_REDIRECT/.test(err.message ?? "")) return;
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  const typeInfo = state.type ? GAME_TYPES[state.type] : null;
  const minSongs = typeInfo?.minSongs ?? 1;
  const songsValid = state.songIds.length >= minSongs;

  return (
    <>
      <Link
        href="/games"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Games
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
        {editingGame ? "Edit Game" : "Create a Game"}
      </h1>

      <div className="mb-8 flex justify-center">
        <ProgressSteps currentStep={state.step} totalSteps={3} />
      </div>

      {state.step === 1 && (
        <StepType selectedType={state.type} onSelect={(t) => dispatch({ kind: "set-type", type: t })} />
      )}

      {state.step === 2 && state.type && (
        <StepSongs
          songs={songs}
          selectedIds={state.songIds}
          minSongs={minSongs}
          onToggle={(id) => dispatch({ kind: "toggle-song", songId: id })}
          gameTypeName={typeInfo!.name}
        />
      )}

      {state.step === 3 && state.type && state.settings && (
        <StepSettings
          type={state.type}
          name={state.name}
          songs={songs.filter((s) => state.songIds.includes(s.id))}
          settings={state.settings}
          onNameChange={(name) => dispatch({ kind: "set-name", name })}
          onSettingsChange={(settings) => dispatch({ kind: "set-settings", settings })}
        />
      )}

      {error && (
        <p className="text-sm font-medium text-game-coral mt-6 text-center">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-center mt-8">
        {state.step > 1 && (
          <button
            type="button"
            onClick={goBack}
            disabled={pending}
            className="px-5 py-3 rounded-xl bg-card border-2 border-border font-bold disabled:opacity-50"
          >
            Back
          </button>
        )}

        {state.step === 2 && (
          <button
            type="button"
            onClick={goNext}
            disabled={!songsValid}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        )}

        {state.step === 3 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="px-6 py-3 rounded-xl bg-game-green text-white font-bold shadow-soft disabled:opacity-50"
          >
            {pending ? "Saving…" : editingGame ? "Save Changes" : "Create Game"}
          </button>
        )}
      </div>
    </>
  );
}

// ──────────────────────────── Step 1: Choose Type ────────────────────────────

function StepType({
  selectedType,
  onSelect,
}: {
  selectedType: GameType | null;
  onSelect: (type: GameType) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-extrabold text-center mb-6">
        Choose a Game Type
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_TYPE_LIST.map((g) => {
          const Icon = g.icon;
          const accent = accentClasses[g.accent];
          const selected = selectedType === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className={`bg-card rounded-3xl p-6 shadow-soft text-left transition border-2 ${
                selected
                  ? "border-primary"
                  : "border-transparent hover:border-primary/30"
              }`}
            >
              <div
                className={`w-12 h-12 ${accent.bg} rounded-2xl flex items-center justify-center mb-3 text-white`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold mb-1">{g.name}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {g.description}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Needs at least {g.minSongs} {g.minSongs === 1 ? "song" : "songs"}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ──────────────────────────── Step 2: Select Songs ────────────────────────────

function StepSongs({
  songs,
  selectedIds,
  minSongs,
  onToggle,
  gameTypeName,
}: {
  songs: Song[];
  selectedIds: string[];
  minSongs: number;
  onToggle: (id: string) => void;
  gameTypeName: string;
}) {
  if (songs.length === 0) {
    return (
      <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
        <h2 className="text-2xl font-extrabold mb-2">No songs yet</h2>
        <p className="text-muted-foreground mb-6">
          Add at least one song to your library before creating a game.
        </p>
        <Link
          href="/songs/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
        >
          Add a Song
        </Link>
      </div>
    );
  }

  const enough = selectedIds.length >= minSongs;

  return (
    <>
      <h2 className="text-2xl font-extrabold text-center mb-2">Select Songs</h2>
      <p className="text-center text-muted-foreground mb-6">
        {gameTypeName} needs at least {minSongs}{" "}
        {minSongs === 1 ? "song" : "songs"}.{" "}
        <span className={enough ? "text-game-green" : "text-game-coral"}>
          {selectedIds.length} selected
        </span>
      </p>
      <div className="bg-card rounded-3xl shadow-soft p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
        <div className="flex flex-col gap-2">
          {songs.map((song) => {
            const checked = selectedIds.includes(song.id);
            return (
              <label
                key={song.id}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition ${
                  checked ? "bg-primary/10" : "bg-muted hover:bg-muted/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(song.id)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-bold">{song.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {song.verses.length}{" "}
                    {song.verses.length === 1 ? "section" : "sections"}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────── Step 3: Settings ────────────────────────────

function StepSettings({
  type,
  name,
  songs,
  settings,
  onNameChange,
  onSettingsChange,
}: {
  type: GameType;
  name: string;
  songs: Song[];
  settings: GameSettings;
  onNameChange: (n: string) => void;
  onSettingsChange: (s: GameSettings) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-extrabold text-center mb-6">
        Configure Settings
      </h2>

      <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="mb-5">
          <label htmlFor="game-name" className="block text-sm font-semibold mb-2">
            Game Name
          </label>
          <input
            id="game-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Sunday School Memory"
            className="w-full px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-base"
          />
        </div>

        {type === "memory-match" && (
          <ConfigureMemoryMatch
            songs={songs}
            settings={settings as Extract<GameSettings, { contentType: "image-text" | "lyric-lyric" | "song-verse" }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "flashcards" && (
          <ConfigureFlashcards
            settings={settings as Extract<GameSettings, { flipDirection: "lyric-to-song" | "song-to-lyric" }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "lyric-match" && (
          <ConfigureLyricMatch
            settings={settings as Extract<GameSettings, { matchType: "line-halves" | "question-answer" | "song-lyric" }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "verse-order" && (
          <ConfigureVerseOrder
            settings={settings as Extract<GameSettings, { granularity: "verses" | "lines" }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "fill-in-blank" && (
          <ConfigureFillInBlank
            settings={settings as Extract<GameSettings, { difficulty: "easy" | "medium" | "hard" }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "bingo" && (
          <ConfigureBingo
            settings={settings as Extract<GameSettings, { cardSize: 3 | 4 | 5 }>}
            onChange={onSettingsChange}
          />
        )}

        {type === "jeopardy" && (
          <ConfigureJeopardy
            songs={songs}
            settings={settings as Extract<GameSettings, { categories: { name: string; questions: { points: number; clue: string; answer: string; songId?: string }[] }[] }>}
            onChange={onSettingsChange}
          />
        )}
      </div>
    </>
  );
}
