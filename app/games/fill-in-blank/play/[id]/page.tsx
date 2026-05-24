import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { FillInBlankPlay } from "@/components/games/play/FillInBlankPlay";

export default async function FillInBlankPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "fill-in-blank") notFound();

  const songs = await getSongsByIds(userId, game.songIds);
  return <FillInBlankPlay game={game} songs={songs} />;
}
