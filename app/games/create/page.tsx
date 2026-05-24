import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { listSongs } from "@/lib/data/songs";
import { getGame } from "@/lib/data/games";
import { CreateGameWizard } from "@/components/games/create/CreateGameWizard";
import { PageLayout } from "@/components/page-layout";

export default async function CreateGamePage({
  searchParams,
}: {
  searchParams: Promise<{ songId?: string; gameId?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;

  const { songId, gameId } = await searchParams;
  const songs = await listSongs(userId);

  let editingGame = undefined;
  if (gameId) {
    const found = await getGame(userId, gameId);
    if (!found) notFound();
    editingGame = found;
  }

  const preselectedSongIds =
    songId && songs.some((s) => s.id === songId) ? [songId] : [];

  return (
    <PageLayout size="lg">
      <CreateGameWizard
        songs={songs}
        preselectedSongIds={preselectedSongIds}
        editingGame={editingGame}
      />
    </PageLayout>
  );
}
