import type { GameType, GameTypeInfo } from "./types";

export const GAME_TYPES: Record<GameType, GameTypeInfo> = {
  jeopardy: {
    id: "jeopardy",
    name: "Jeopardy",
    description: "Quiz-style game with categories and point values",
    icon: "Trophy",
    minSongs: 3,
    color: "primary",
  },
  "fill-blank": {
    id: "fill-blank",
    name: "Fill in the Blank",
    description: "Complete missing lyrics from your favorite hymns",
    icon: "PenLine",
    minSongs: 1,
    color: "secondary",
  },
  "verse-order": {
    id: "verse-order",
    name: "Verse Order",
    description: "Arrange verses or lines in the correct sequence",
    icon: "ListOrdered",
    minSongs: 1,
    color: "accent",
  },
  "lyric-match": {
    id: "lyric-match",
    name: "Lyric Match",
    description: "Connect matching lyrics and song titles",
    icon: "Link",
    minSongs: 2,
    color: "success",
  },
  flashcards: {
    id: "flashcards",
    name: "Flashcards",
    description: "Study and review lyrics with flip cards",
    icon: "Layers",
    minSongs: 1,
    color: "primary",
  },
  bingo: {
    id: "bingo",
    name: "Song Bingo",
    description: "Classic bingo with hymn lyrics and titles",
    icon: "Grid3X3",
    minSongs: 5,
    color: "secondary",
  },
  "memory-match": {
    id: "memory-match",
    name: "Memory Match",
    description: "Classic card matching with hymn content",
    icon: "Brain",
    minSongs: 2,
    color: "accent",
  },
};

export const GAME_TYPE_LIST = Object.values(GAME_TYPES);

export function getGameTypeInfo(type: GameType): GameTypeInfo {
  return GAME_TYPES[type];
}

export function getDefaultSettings(type: GameType) {
  switch (type) {
    case "jeopardy":
      return {
        categories: [],
        finalJeopardy: undefined,
      };
    case "fill-blank":
      return {
        difficulty: "medium" as const,
        hintMode: true,
        timerSeconds: undefined,
        wordsToHide: 30,
      };
    case "verse-order":
      return {
        granularity: "verses" as const,
        scrambleLevel: "full" as const,
      };
    case "lyric-match":
      return {
        pairCount: 6,
        matchType: "line-halves" as const,
      };
    case "flashcards":
      return {
        flipDirection: "lyric-to-song" as const,
        studyMode: "sequential" as const,
        showHints: true,
      };
    case "bingo":
      return {
        cardSize: 5 as const,
        contentType: "mixed" as const,
        freeSpace: true,
      };
    case "memory-match":
      return {
        pairCount: 8,
        contentType: "lyric-lyric" as const,
      };
  }
}
