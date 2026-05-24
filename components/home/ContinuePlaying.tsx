import Link from "next/link";
import { Play } from "lucide-react";
import { GAME_TYPES, accentClasses } from "@/lib/game-types";
import { formatRelativeTime } from "@/lib/utils";
import type { Game } from "@/lib/types";

export interface ContinuePlayingProps {
  games: Game[];
}

export function ContinuePlaying({ games }: ContinuePlayingProps) {
  if (games.length === 0) return null;

  return (
    <section className="bg-card py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-extrabold mb-8">
          Continue Playing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => {
            const info = GAME_TYPES[game.gameType];
            const Icon = info.icon;
            const accent = accentClasses[info.accent];
            return (
              <Link
                key={game.id}
                href={`/games/${game.gameType}/play/${game.id}`}
                className="bg-muted rounded-2xl p-5 flex items-center gap-4 hover:bg-muted/70 transition-colors group"
              >
                <div className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{game.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Played {formatRelativeTime(game.lastPlayedAt)}
                  </p>
                </div>
                <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 ml-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
