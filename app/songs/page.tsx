import Link from "next/link";
import { Plus, Music } from "lucide-react";
import { auth } from "@/lib/auth";
import { listSongs } from "@/lib/data/songs";
import { SongList } from "@/components/songs/SongList";
import { PageLayout } from "@/components/page-layout";

export default async function SongsPage() {
  const session = await auth();
  // proxy.ts guarantees auth, but TS doesn't know.
  const userId = session!.user!.id;

  const songs = await listSongs(userId);

  return (
    <PageLayout size="md">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Song Library</h1>
          <p className="text-muted-foreground mt-1">
            {songs.length === 0
              ? "Add your first song to get started."
              : `${songs.length} ${songs.length === 1 ? "song" : "songs"} ready to play.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/songs/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border-2 border-border font-bold text-sm"
          >
            <Music className="w-4 h-4" /> From sheet music
          </Link>
          <Link
            href="/songs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-game-green text-white font-bold text-sm shadow-soft"
          >
            <Plus className="w-4 h-4" /> Add Song
          </Link>
        </div>
      </div>

      <SongList songs={songs} />
    </PageLayout>
  );
}
