import "server-only";
import { and, desc, eq, sql, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { games } from "@/db/schema";
import type { Game, GameSettings, GameType } from "@/lib/types";

const toGame = (row: typeof games.$inferSelect): Game => ({
  id: row.id,
  userId: row.userId,
  gameType: row.gameType,
  name: row.name,
  songIds: row.songIds,
  settings: row.settings,
  lastPlayedAt: row.lastPlayedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export interface GameInput {
  gameType: GameType;
  name: string;
  songIds: string[];
  settings: GameSettings;
}

export async function listGames(
  userId: string,
  opts?: { gameType?: GameType; limit?: number }
): Promise<Game[]> {
  const conditions = [eq(games.userId, userId)];
  if (opts?.gameType) conditions.push(eq(games.gameType, opts.gameType));

  const query = db
    .select()
    .from(games)
    .where(and(...conditions))
    .orderBy(desc(games.updatedAt));

  const rows = opts?.limit ? await query.limit(opts.limit) : await query;
  return rows.map(toGame);
}

export async function listRecentGames(
  userId: string,
  limit: number
): Promise<Game[]> {
  const rows = await db
    .select()
    .from(games)
    .where(and(eq(games.userId, userId), isNotNull(games.lastPlayedAt)))
    .orderBy(desc(games.lastPlayedAt))
    .limit(limit);
  return rows.map(toGame);
}

export async function getGame(
  userId: string,
  id: string
): Promise<Game | null> {
  const [row] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, id), eq(games.userId, userId)))
    .limit(1);
  return row ? toGame(row) : null;
}

export async function createGame(
  userId: string,
  input: GameInput
): Promise<Game> {
  const [row] = await db
    .insert(games)
    .values({
      userId,
      gameType: input.gameType,
      name: input.name,
      songIds: input.songIds,
      settings: input.settings,
    })
    .returning();
  return toGame(row);
}

export async function updateGame(
  userId: string,
  id: string,
  input: GameInput
): Promise<Game | null> {
  const [row] = await db
    .update(games)
    .set({
      gameType: input.gameType,
      name: input.name,
      songIds: input.songIds,
      settings: input.settings,
    })
    .where(and(eq(games.id, id), eq(games.userId, userId)))
    .returning();
  return row ? toGame(row) : null;
}

export async function deleteGame(
  userId: string,
  id: string
): Promise<Game | null> {
  // Return the deleted row so callers can clean up associated files.
  const [row] = await db
    .delete(games)
    .where(and(eq(games.id, id), eq(games.userId, userId)))
    .returning();
  return row ? toGame(row) : null;
}

export async function recordGamePlayed(
  userId: string,
  id: string
): Promise<void> {
  await db
    .update(games)
    .set({ lastPlayedAt: new Date() })
    .where(and(eq(games.id, id), eq(games.userId, userId)));
}

export async function countGames(
  userId: string,
  opts?: { played?: boolean }
): Promise<number> {
  const conditions = [eq(games.userId, userId)];
  if (opts?.played) conditions.push(isNotNull(games.lastPlayedAt));
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(games)
    .where(and(...conditions));
  return row?.count ?? 0;
}

/** Returns games that reference the given song id in their song_ids array. */
export async function findGamesReferencingSong(
  userId: string,
  songId: string
): Promise<Game[]> {
  const rows = await db
    .select()
    .from(games)
    .where(
      and(
        eq(games.userId, userId),
        sql`${songId}::uuid = ANY(${games.songIds})`
      )
    );
  return rows.map(toGame);
}

/** Aggregate counts grouped by game_type. */
export async function countGamesByType(
  userId: string
): Promise<Partial<Record<GameType, number>>> {
  const rows = await db
    .select({
      gameType: games.gameType,
      count: sql<number>`count(*)::int`,
    })
    .from(games)
    .where(eq(games.userId, userId))
    .groupBy(games.gameType);
  const map: Partial<Record<GameType, number>> = {};
  for (const r of rows) {
    map[r.gameType] = r.count;
  }
  return map;
}
