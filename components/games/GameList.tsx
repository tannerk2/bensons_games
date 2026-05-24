"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Play, Trash2 } from "lucide-react";
import { GAME_TYPES, accentClasses } from "@/lib/game-types";
import { formatRelativeTime } from "@/lib/utils";
import { deleteGameAction } from "@/app/games/actions";
import type { Game, GameType } from "@/lib/types";

export interface GameListProps {
  games: Game[];
  filterType?: GameType;
}

export function GameList({ games, filterType }: GameListProps) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = filterType
    ? games.filter((g) => g.gameType === filterType)
    : games;

  const handleDelete = (game: Game) => {
    if (!confirm(`Delete "${game.name}"?`)) return;
    setDeletingId(game.id);
    startTransition(async () => {
      await deleteGameAction(game.id);
      setDeletingId(null);
    });
  };

  if (filtered.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        {filterType
          ? "No games of this type yet."
          : "No games yet. Create your first one above."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((game) => {
        const info = GAME_TYPES[game.gameType];
        const Icon = info.icon;
        const accent = accentClasses[info.accent];
        return (
          <div
            key={game.id}
            className="bg-card rounded-3xl shadow-soft p-5 flex flex-col gap-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 ${accent.bg} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold leading-tight truncate">
                  {game.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {info.name} · {game.songIds.length}{" "}
                  {game.songIds.length === 1 ? "song" : "songs"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {game.lastPlayedAt
                    ? `Played ${formatRelativeTime(game.lastPlayedAt)}`
                    : `Created ${formatRelativeTime(game.createdAt)}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/games/${game.gameType}/play/${game.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
              >
                <Play className="w-4 h-4" /> Play
              </Link>
              <Link
                href={`/games/create?gameId=${game.id}`}
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(game)}
                disabled={pending && deletingId === game.id}
                title="Delete"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-game-coral hover:bg-game-coral/10 font-bold text-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
