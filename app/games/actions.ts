"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import {
  parseGameFormData,
  type GameInputParsed,
} from "@/lib/validation/game";
import {
  createGame,
  deleteGame,
  recordGamePlayed,
  updateGame,
} from "@/lib/data/games";
import { getSongsByIds } from "@/lib/data/songs";
import { storage } from "@/lib/storage";
import type { Game, GameSettings, MemoryMatchSettings } from "@/lib/types";

export type GameActionResult =
  | { ok: true; gameId: string; gameType: string }
  | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function zodMessage(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "Invalid input";
  }
  return err instanceof Error ? err.message : "Invalid input";
}

async function validateSongOwnership(
  userId: string,
  songIds: readonly string[]
): Promise<string | null> {
  if (songIds.length === 0) return null;
  const owned = await getSongsByIds(userId, songIds);
  const ownedSet = new Set(owned.map((s) => s.id));
  for (const id of songIds) {
    if (!ownedSet.has(id)) return `Song ${id} not found in your library`;
  }
  return null;
}

export async function createGameAction(
  _prev: GameActionResult | null,
  formData: FormData
): Promise<GameActionResult> {
  const userId = await requireUserId();

  let parsed: GameInputParsed;
  try {
    parsed = parseGameFormData(formData);
  } catch (err) {
    return { ok: false, error: zodMessage(err) };
  }

  const ownershipErr = await validateSongOwnership(userId, parsed.songIds);
  if (ownershipErr) return { ok: false, error: ownershipErr };

  const created = await createGame(userId, {
    gameType: parsed.gameType,
    name: parsed.name,
    songIds: parsed.songIds,
    settings: parsed.settings as GameSettings,
  });

  revalidatePath("/games");
  redirect(`/games/${created.gameType}/play/${created.id}`);
}

export async function updateGameAction(
  id: string,
  _prev: GameActionResult | null,
  formData: FormData
): Promise<GameActionResult> {
  const userId = await requireUserId();

  let parsed: GameInputParsed;
  try {
    parsed = parseGameFormData(formData);
  } catch (err) {
    return { ok: false, error: zodMessage(err) };
  }

  const ownershipErr = await validateSongOwnership(userId, parsed.songIds);
  if (ownershipErr) return { ok: false, error: ownershipErr };

  const updated = await updateGame(userId, id, {
    gameType: parsed.gameType,
    name: parsed.name,
    songIds: parsed.songIds,
    settings: parsed.settings as GameSettings,
  });
  if (!updated) return { ok: false, error: "Game not found" };

  revalidatePath("/games");
  redirect(`/games/${updated.gameType}/play/${updated.id}`);
}

async function cleanupGameFiles(game: Game): Promise<void> {
  if (game.gameType !== "memory-match") return;
  const settings = game.settings as MemoryMatchSettings;
  if (!settings.pairs) return;
  for (const pair of settings.pairs) {
    if (pair.type === "image" && pair.url?.startsWith("/uploads/")) {
      const key = pair.url.slice("/uploads/".length);
      await storage.deleteFile(key).catch(() => {
        /* best-effort */
      });
    }
  }
}

export async function deleteGameAction(id: string): Promise<void> {
  const userId = await requireUserId();
  const removed = await deleteGame(userId, id);
  if (removed) await cleanupGameFiles(removed);
  revalidatePath("/games");
}

export async function recordGamePlayedAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await recordGamePlayed(userId, id);
}
