import { z } from "zod";

export const songVerseSchema = z.object({
  title: z.string().trim().max(80).optional(),
  lines: z
    .array(z.string().trim())
    // Strip empty lines so a verse with only blank textarea content is empty.
    .transform((arr) => arr.filter((s) => s.length > 0)),
});

export const songInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    verses: z.array(songVerseSchema).min(1, "Add at least one verse"),
  })
  .superRefine((value, ctx) => {
    const hasContent = value.verses.some((v) => v.lines.length > 0);
    if (!hasContent) {
      ctx.addIssue({
        code: "custom",
        message: "At least one verse must have lyrics",
        path: ["verses"],
      });
    }
  });

export type SongInputParsed = z.infer<typeof songInputSchema>;

/**
 * Convenience parser used by server actions: takes a FormData-like object
 * shaped as { title, versesJson } and returns parsed input.
 *
 * Forms send the verses as a serialized JSON string in a hidden input so we
 * can keep the verse-editor UI rich without inventing FormData encodings.
 */
export function parseSongFormData(data: FormData): SongInputParsed {
  const title = String(data.get("title") ?? "");
  const versesJson = String(data.get("verses") ?? "[]");
  let verses: unknown;
  try {
    verses = JSON.parse(versesJson);
  } catch {
    verses = [];
  }
  return songInputSchema.parse({ title, verses });
}
