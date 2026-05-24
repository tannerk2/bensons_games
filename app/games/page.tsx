import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listGames } from "@/lib/data/games";
import { GameList } from "@/components/games/GameList";
import { GameTypeFilter } from "@/components/games/GameTypeFilter";
import { getValidatedType } from "@/lib/validation/game";
import { PageLayout } from "@/components/page-layout";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;

  const { type } = await searchParams;
  const filterType = getValidatedType(type);

  const allGames = await listGames(userId);

  return (
    <PageLayout size="lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">My Games</h1>
          <p className="text-muted-foreground mt-1">
            {allGames.length === 0
              ? "Create your first game to get started."
              : `${allGames.length} ${allGames.length === 1 ? "game" : "games"} in your library.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GameTypeFilter />
          <Link
            href="/games/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
          >
            <Plus className="w-4 h-4" /> Create Game
          </Link>
        </div>
      </div>

      <GameList games={allGames} filterType={filterType} />
    </PageLayout>
  );
}
