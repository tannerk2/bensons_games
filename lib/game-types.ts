import {
  Trophy,
  PenLine,
  ListOrdered,
  Link2,
  Layers,
  Grid3X3,
  Brain,
  type LucideIcon,
} from "lucide-react";
import type {
  GameType,
  GameSettings,
  JeopardySettings,
  FillInBlankSettings,
  VerseOrderSettings,
  LyricMatchSettings,
  FlashcardSettings,
  BingoSettings,
  MemoryMatchSettings,
} from "./types";

/** Palette key used to colorize cards, badges, and accents per game type. */
export type GameAccent = "blue" | "coral" | "yellow" | "green" | "purple" | "pink";

export interface GameTypeInfo {
  id: GameType;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: GameAccent;
  /** Minimum number of songs the user must select when creating this game. */
  minSongs: number;
  /** Factory returns a fresh, valid default settings object. */
  defaultSettings: () => GameSettings;
}

const defaultJeopardy = (): JeopardySettings => ({
  categories: [],
});

const defaultFillInBlank = (): FillInBlankSettings => ({
  difficulty: "medium",
  hintMode: true,
  wordsToHide: 30,
});

const defaultVerseOrder = (): VerseOrderSettings => ({
  granularity: "verses",
  scrambleLevel: "full",
});

const defaultLyricMatch = (): LyricMatchSettings => ({
  pairCount: 6,
  matchType: "line-halves",
});

const defaultFlashcards = (): FlashcardSettings => ({
  flipDirection: "lyric-to-song",
  studyMode: "sequential",
  showHints: true,
});

const defaultBingo = (): BingoSettings => ({
  cardSize: 5,
  contentType: "mixed",
  freeSpace: true,
});

const defaultMemoryMatch = (): MemoryMatchSettings => ({
  pairCount: 6,
  contentType: "lyric-lyric",
  themeColor: "#4A90D9",
  aspectRatio: 1,
});

export const GAME_TYPES: Record<GameType, GameTypeInfo> = {
  jeopardy: {
    id: "jeopardy",
    name: "Jeopardy",
    description: "Quiz-style game with categories and points",
    icon: Trophy,
    accent: "blue",
    minSongs: 3,
    defaultSettings: defaultJeopardy,
  },
  "fill-in-blank": {
    id: "fill-in-blank",
    name: "Fill in the Blank",
    description: "Complete the missing lyrics",
    icon: PenLine,
    accent: "coral",
    minSongs: 1,
    defaultSettings: defaultFillInBlank,
  },
  "verse-order": {
    id: "verse-order",
    name: "Verse Order",
    description: "Put verses in the correct sequence",
    icon: ListOrdered,
    accent: "yellow",
    minSongs: 1,
    defaultSettings: defaultVerseOrder,
  },
  "lyric-match": {
    id: "lyric-match",
    name: "Lyric Match",
    description: "Match line beginnings to endings",
    icon: Link2,
    accent: "green",
    minSongs: 2,
    defaultSettings: defaultLyricMatch,
  },
  flashcards: {
    id: "flashcards",
    name: "Flashcards",
    description: "Study cards for memorization",
    icon: Layers,
    accent: "purple",
    minSongs: 1,
    defaultSettings: defaultFlashcards,
  },
  bingo: {
    id: "bingo",
    name: "Song Bingo",
    description: "Fun group activity with lyrics",
    icon: Grid3X3,
    accent: "pink",
    minSongs: 5,
    defaultSettings: defaultBingo,
  },
  "memory-match": {
    id: "memory-match",
    name: "Memory Match",
    description: "Classic card matching with hymn content",
    icon: Brain,
    accent: "blue",
    minSongs: 1,
    defaultSettings: defaultMemoryMatch,
  },
};

export const GAME_TYPE_LIST: GameTypeInfo[] = Object.values(GAME_TYPES);

export function getGameTypeInfo(type: GameType): GameTypeInfo {
  return GAME_TYPES[type];
}

export function getDefaultSettings(type: GameType): GameSettings {
  return GAME_TYPES[type].defaultSettings();
}

/**
 * Tailwind class shortcuts per accent. Used by GameTypeGrid and the per-type
 * play screens. Centralizing these keeps the design tokens consistent.
 */
export const accentClasses: Record<
  GameAccent,
  { bg: string; bgSoft: string; text: string; gradient: string }
> = {
  blue: {
    bg: "bg-game-blue",
    bgSoft: "bg-game-blue/10",
    text: "text-game-blue",
    gradient: "from-game-blue to-game-blue/80",
  },
  coral: {
    bg: "bg-game-coral",
    bgSoft: "bg-game-coral/10",
    text: "text-game-coral",
    gradient: "from-game-coral to-game-coral/80",
  },
  yellow: {
    bg: "bg-game-yellow",
    bgSoft: "bg-game-yellow/10",
    text: "text-game-yellow",
    gradient: "from-game-yellow to-game-yellow/80",
  },
  green: {
    bg: "bg-game-green",
    bgSoft: "bg-game-green/10",
    text: "text-game-green",
    gradient: "from-game-green to-game-green/80",
  },
  purple: {
    bg: "bg-game-purple",
    bgSoft: "bg-game-purple/10",
    text: "text-game-purple",
    gradient: "from-game-purple to-game-purple/80",
  },
  pink: {
    bg: "bg-game-pink",
    bgSoft: "bg-game-pink/10",
    text: "text-game-pink",
    gradient: "from-game-pink to-game-pink/80",
  },
};
