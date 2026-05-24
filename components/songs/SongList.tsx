"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Music, Search, Plus, Pencil, Trash2, Gamepad2 } from "lucide-react";
import { deleteSongAction } from "@/app/songs/actions";
import { formatRelativeTime } from "@/lib/utils";
import type { Song } from "@/lib/types";

export interface SongListProps {
  songs: Song[];
}

export function SongList({ songs }: SongListProps) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleDelete = async (song: Song) => {
    if (!confirm(`Delete "${song.title}"?`)) return;
    setDeletingId(song.id);
    startTransition(async () => {
      const first = await deleteSongAction(song.id);
      if (first.ok) {
        setDeletingId(null);
        return;
      }
      // Has references — confirm with the user.
      const names = first.references.map((r) => r.name).join(", ");
      const proceed = confirm(
        `"${song.title}" is used by ${first.references.length} game${first.references.length === 1 ? "" : "s"} (${names}). Deleting the song may break those games. Delete anyway?`
      );
      if (!proceed) {
        setDeletingId(null);
        return;
      }
      await deleteSongAction(song.id, { force: true });
      setDeletingId(null);
    });
  };

  if (songs.length === 0) {
    return (
      <div className="bg-card rounded-3xl shadow-soft p-12 text-center">
        <div className="w-16 h-16 bg-game-yellow/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Music className="w-8 h-8 text-game-yellow" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">No songs yet</h2>
        <p className="text-muted-foreground mb-6">
          Add your first song to start creating games.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/songs/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft"
          >
            <Plus className="w-5 h-5" /> Add manually
          </Link>
          <Link
            href="/songs/import"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card border-2 border-border font-bold shadow-soft"
          >
            <Music className="w-5 h-5" /> Upload sheet music
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border-2 border-border p-3 mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-muted-foreground ml-1" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs..."
          className="flex-1 outline-none bg-transparent text-base"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No songs match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((song) => (
            <div
              key={song.id}
              className="bg-card rounded-3xl shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-game-yellow), var(--color-game-coral))",
                  }}
                >
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold leading-tight">{song.title}</h3>
                  <p className="text-sm text-muted-foreground leading-tight">
                    {song.verses.length}{" "}
                    {song.verses.length === 1 ? "section" : "sections"} ·
                    Updated {formatRelativeTime(song.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/games/create?songId=${song.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
                >
                  <Gamepad2 className="w-4 h-4" /> Create Game
                </Link>
                <Link
                  href={`/songs/${song.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(song)}
                  disabled={pending && deletingId === song.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-game-coral hover:bg-game-coral/10 font-bold text-sm disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
