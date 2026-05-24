import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GAME_TYPE_LIST, accentClasses } from "@/lib/game-types";

export interface GameTypeGridProps {
  /** Map of game-type id → number of saved games. */
  counts?: Partial<Record<string, number>>;
}

export function GameTypeGrid({ counts = {} }: GameTypeGridProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Choose a Game Type</h3>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {GAME_TYPE_LIST.length} game types available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {GAME_TYPE_LIST.map((game) => {
            const Icon = game.icon;
            const count = counts[game.id] ?? 0;
            const accent = accentClasses[game.accent];
            return (
              <Link
                key={game.id}
                href={`/games?type=${game.id}`}
                className="group bg-card rounded-3xl p-6 sm:p-7 shadow-soft hover:shadow-lg transition-all hover:-translate-y-0.5 border-2 border-transparent hover:border-primary/20"
              >
                <div
                  className={`w-14 h-14 ${accent.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-extrabold mb-2">{game.name}</h4>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-semibold">
                    {count === 1 ? "1 game saved" : `${count} games saved`}
                  </span>
                  <span className={`text-sm font-semibold ${accent.text} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Play <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
