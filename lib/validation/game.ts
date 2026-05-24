import { z } from "zod";
import type { GameType } from "@/lib/types";

const uuidSchema = z.string().uuid();

// ──────────────────────────── Per-type settings ────────────────────────────

const jeopardySettingsSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().min(1),
      questions: z.array(
        z.object({
          points: z.number().int().nonnegative(),
          clue: z.string().min(1),
          answer: z.string().min(1),
          songId: uuidSchema.optional(),
        })
      ),
    })
  ),
  finalJeopardy: z
    .object({
      category: z.string().min(1),
      clue: z.string().min(1),
      answer: z.string().min(1),
    })
    .optional(),
});

const fillInBlankSettingsSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  hintMode: z.boolean(),
  wordsToHide: z.number().min(0).max(100),
  timerSeconds: z.number().int().positive().optional(),
});

const verseOrderSettingsSchema = z.object({
  granularity: z.enum(["verses", "lines"]),
  scrambleLevel: z.enum(["light", "full"]),
});

const lyricMatchSettingsSchema = z.object({
  pairCount: z.number().int().min(2).max(20),
  matchType: z.enum(["line-halves", "question-answer", "song-lyric"]),
});

const flashcardSettingsSchema = z.object({
  flipDirection: z.enum(["lyric-to-song", "song-to-lyric"]),
  studyMode: z.enum(["sequential", "shuffle", "spaced"]),
  showHints: z.boolean(),
});

const bingoSettingsSchema = z.object({
  cardSize: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  contentType: z.enum(["lyrics", "song-titles", "mixed"]),
  freeSpace: z.boolean(),
});

const memoryMatchPairSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["image", "text"]),
  url: z.string().optional(),
  text: z.string().optional(),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
});

const memoryMatchSettingsSchema = z.object({
  pairCount: z.number().int().min(2).max(20),
  contentType: z.enum(["image-text", "lyric-lyric", "song-verse"]),
  themeColor: z.string().optional(),
  aspectRatio: z.number().positive().optional(),
  pairs: z.array(memoryMatchPairSchema).optional(),
});

export const gameSettingsByType = {
  jeopardy: jeopardySettingsSchema,
  "fill-in-blank": fillInBlankSettingsSchema,
  "verse-order": verseOrderSettingsSchema,
  "lyric-match": lyricMatchSettingsSchema,
  flashcards: flashcardSettingsSchema,
  bingo: bingoSettingsSchema,
  "memory-match": memoryMatchSettingsSchema,
} as const;

export function parseGameSettings(type: GameType, raw: unknown) {
  return gameSettingsByType[type].parse(raw);
}

// ──────────────────────────── Game input ────────────────────────────

export const gameTypeSchema = z.enum([
  "jeopardy",
  "fill-in-blank",
  "verse-order",
  "lyric-match",
  "flashcards",
  "bingo",
  "memory-match",
]);

export function getValidatedType(raw: string | undefined) {
  if (!raw) return undefined;
  const result = gameTypeSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export const gameInputSchema = z
  .object({
    gameType: gameTypeSchema,
    name: z.string().trim().min(1, "Name is required").max(120),
    songIds: z.array(uuidSchema),
    settings: z.unknown(),
  })
  .superRefine((value, ctx) => {
    try {
      gameSettingsByType[value.gameType].parse(value.settings);
    } catch (err) {
      ctx.addIssue({
        code: "custom",
        message:
          err instanceof Error ? `Invalid settings: ${err.message}` : "Invalid settings",
        path: ["settings"],
      });
    }
  });

export type GameInputParsed = z.infer<typeof gameInputSchema>;

export function parseGameFormData(data: FormData): GameInputParsed {
  return gameInputSchema.parse({
    gameType: data.get("gameType"),
    name: data.get("name"),
    songIds: JSON.parse(String(data.get("songIds") ?? "[]")),
    settings: JSON.parse(String(data.get("settings") ?? "{}")),
  });
}
