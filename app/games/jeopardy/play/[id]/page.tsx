import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGame } from "@/lib/data/games";
import { JeopardyPlay } from "@/components/games/play/JeopardyPlay";

export default async function JeopardyPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const game = await getGame(userId, id);
  if (!game || game.gameType !== "jeopardy") notFound();

  return <JeopardyPlay game={game} />;
}
