import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { VerseOrderPlay } from "@/components/games/play/VerseOrderPlay";

export default async function VerseOrderPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "verse-order") notFound();

  const songs = await getSongsByIds(userId, game.songIds);
  return <VerseOrderPlay game={game} songs={songs} />;
}
