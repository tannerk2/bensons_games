import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { songs } from "@/db/schema";
import type { Song, SongVerse } from "@/lib/types";

const toSong = (row: typeof songs.$inferSelect): Song => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  verses: row.verses,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export interface SongInput {
  title: string;
  verses: SongVerse[];
}

export async function listSongs(userId: string): Promise<Song[]> {
  const rows = await db
    .select()
    .from(songs)
    .where(eq(songs.userId, userId))
    .orderBy(desc(songs.updatedAt));
  return rows.map(toSong);
}

export async function getSong(userId: string, id: string): Promise<Song | null> {
  const [row] = await db
    .select()
    .from(songs)
    .where(and(eq(songs.id, id), eq(songs.userId, userId)))
    .limit(1);
  return row ? toSong(row) : null;
}

export async function getSongsByIds(
  userId: string,
  ids: readonly string[]
): Promise<Song[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(songs)
    .where(and(eq(songs.userId, userId), inArray(songs.id, [...ids])));
  return rows.map(toSong);
}

export async function createSong(
  userId: string,
  input: SongInput
): Promise<Song> {
  const [row] = await db
    .insert(songs)
    .values({
      userId,
      title: input.title,
      verses: input.verses,
    })
    .returning();
  return toSong(row);
}

export async function updateSong(
  userId: string,
  id: string,
  input: SongInput
): Promise<Song | null> {
  const [row] = await db
    .update(songs)
    .set({
      title: input.title,
      verses: input.verses,
    })
    .where(and(eq(songs.id, id), eq(songs.userId, userId)))
    .returning();
  return row ? toSong(row) : null;
}

export async function deleteSong(
  userId: string,
  id: string
): Promise<boolean> {
  const rows = await db
    .delete(songs)
    .where(and(eq(songs.id, id), eq(songs.userId, userId)))
    .returning({ id: songs.id });
  return rows.length > 0;
}

export async function countSongs(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(songs)
    .where(eq(songs.userId, userId));
  return row?.count ?? 0;
}
