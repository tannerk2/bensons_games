import type { Song, SongVerse } from "./types";

export function flatLines(song: Song): string[] {
  return song.verses.flatMap((v) => v.lines).filter((l) => l.trim().length > 0);
}

export function allLinesFromSongs(songs: Song[]): string[] {
  return songs.flatMap(flatLines);
}

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** True if every element is in its original index. */
export function noneInOriginalPosition<T>(
  shuffled: T[],
  original: T[],
  eq: (a: T, b: T) => boolean = Object.is
): boolean {
  return shuffled.every((v, i) => !eq(v, original[i]));
}

/** Returns a derangement (no element in original position) when possible. */
export function derangement<T>(
  arr: T[],
  eq: (a: T, b: T) => boolean = Object.is
): T[] {
  if (arr.length < 2) return arr.slice();
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = shuffle(arr);
    if (noneInOriginalPosition(candidate, arr, eq)) return candidate;
  }
  return shuffle(arr);
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function splitLineHalves(line: string): [string, string] {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [line, ""];
  const mid = Math.floor(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** Yield every {song, line} pair, with the source song reference. */
export function songLinePairs(songs: Song[]): Array<{ song: Song; line: string }> {
  return songs.flatMap((s) => flatLines(s).map((line) => ({ song: s, line })));
}

/** All verses across songs with the song they came from. */
export function songVerses(songs: Song[]): Array<{ song: Song; verse: SongVerse }> {
  return songs.flatMap((s) => s.verses.map((v) => ({ song: s, verse: v })));
}
