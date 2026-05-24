import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { MemoryMatchPlay } from "@/components/games/play/MemoryMatchPlay";

export default async function MemoryMatchPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "memory-match") notFound();

  const songs = await getSongsByIds(userId, game.songIds);

  return <MemoryMatchPlay game={game} songs={songs} />;
}
