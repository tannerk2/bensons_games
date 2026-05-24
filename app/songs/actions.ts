"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { parseSongFormData } from "@/lib/validation/song";
import {
  createSong,
  deleteSong,
  updateSong,
} from "@/lib/data/songs";

export type SongActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

function zodMessage(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "Invalid input";
  }
  return "Invalid input";
}

export async function createSongAction(
  _prev: SongActionResult | null,
  formData: FormData
): Promise<SongActionResult> {
  const userId = await requireUserId();
  let parsed;
  try {
    parsed = parseSongFormData(formData);
  } catch (err) {
    return { ok: false, error: zodMessage(err) };
  }

  await createSong(userId, parsed);
  revalidatePath("/songs");
  redirect("/songs");
}

export async function updateSongAction(
  id: string,
  _prev: SongActionResult | null,
  formData: FormData
): Promise<SongActionResult> {
  const userId = await requireUserId();
  let parsed;
  try {
    parsed = parseSongFormData(formData);
  } catch (err) {
    return { ok: false, error: zodMessage(err) };
  }

  const updated = await updateSong(userId, id, parsed);
  if (!updated) {
    return { ok: false, error: "Song not found" };
  }
  revalidatePath("/songs");
  redirect("/songs");
}

export async function deleteSongAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteSong(userId, id);
  revalidatePath("/songs");
}
