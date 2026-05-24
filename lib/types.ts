// ─────────── Song types ───────────

export interface SongVerse {
  /** Optional verse label, e.g. "Verse 1", "Chorus", "Bridge". */
  title?: string;
  /** One element per lyric line, in order. */
  lines: string[];
}

export interface Song {
  id: string;
  userId: string;
  title: string;
  verses: SongVerse[];
  createdAt: Date;
  updatedAt: Date;
}

// ─────────── Game type slugs ───────────

export type GameType =
  | "jeopardy"
  | "fill-in-blank"
  | "verse-order"
  | "lyric-match"
  | "flashcards"
  | "bingo"
  | "memory-match";

// ─────────── Per-type settings ───────────

export interface JeopardySettings {
  categories: Array<{
    name: string;
    questions: Array<{
      points: number;
      clue: string;
      answer: string;
      songId?: string;
    }>;
  }>;
  finalJeopardy?: {
    category: string;
    clue: string;
    answer: string;
  };
}

export interface FillInBlankSettings {
  difficulty: "easy" | "medium" | "hard";
  hintMode: boolean;
  /** Percentage of words to blank out, 0-100. */
  wordsToHide: number;
  /** Optional countdown per question. */
  timerSeconds?: number;
}

export interface VerseOrderSettings {
  granularity: "verses" | "lines";
  scrambleLevel: "light" | "full";
}

export interface LyricMatchSettings {
  pairCount: number;
  matchType: "line-halves" | "question-answer" | "song-lyric";
}

export interface FlashcardSettings {
  flipDirection: "lyric-to-song" | "song-to-lyric";
  studyMode: "sequential" | "shuffle" | "spaced";
  showHints: boolean;
}

export interface BingoSettings {
  cardSize: 3 | 4 | 5;
  contentType: "lyrics" | "song-titles" | "mixed";
  freeSpace: boolean;
}

export interface MemoryMatchPair {
  id: string;
  type: "image" | "text";
  url?: string;
  text?: string;
  position?: { x: number; y: number };
}

export interface MemoryMatchSettings {
  pairCount: number;
  contentType: "image-text" | "lyric-lyric" | "song-verse";
  /** Visual theme color for card backs, in CSS hex. */
  themeColor?: string;
  /** Average aspect ratio of attached images, used for grid sizing. */
  aspectRatio?: number;
  /** Pre-defined pairs when the user customizes content (image or text). */
  pairs?: MemoryMatchPair[];
}

/**
 * Discriminated only by which game_type the row holds. The schema column is a
 * raw JSONB; downstream code uses parseGameSettings(type, raw) to narrow.
 */
export type GameSettings =
  | JeopardySettings
  | FillInBlankSettings
  | VerseOrderSettings
  | LyricMatchSettings
  | FlashcardSettings
  | BingoSettings
  | MemoryMatchSettings;

export interface Game {
  id: string;
  userId: string;
  gameType: GameType;
  name: string;
  songIds: string[];
  settings: GameSettings;
  lastPlayedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
