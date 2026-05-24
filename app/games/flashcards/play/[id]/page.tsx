import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { FlashcardsPlay } from "@/components/games/play/FlashcardsPlay";

export default async function FlashcardsPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "flashcards") notFound();

  const songs = await getSongsByIds(userId, game.songIds);
  return <FlashcardsPlay game={game} songs={songs} />;
}
