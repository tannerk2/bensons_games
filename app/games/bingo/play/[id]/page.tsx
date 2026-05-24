import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { BingoPlay } from "@/components/games/play/BingoPlay";

export default async function BingoPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "bingo") notFound();

  const songs = await getSongsByIds(userId, game.songIds);
  return <BingoPlay game={game} songs={songs} />;
}
