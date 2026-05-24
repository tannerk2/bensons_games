import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { LyricMatchPlay } from "@/components/games/play/LyricMatchPlay";

export default async function LyricMatchPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "lyric-match") notFound();

  const songs = await getSongsByIds(userId, game.songIds);
  return <LyricMatchPlay game={game} songs={songs} />;
}
