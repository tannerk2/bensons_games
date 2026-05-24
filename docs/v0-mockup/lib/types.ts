// Song types
export interface SongVerse {
  title?: string;
  lines: string[];
}

export interface Song {
  id: string;
  user_id?: string;
  title: string;
  verses: SongVerse[];
  created_at: string;
  updated_at: string;
}

// Game types
export type GameType =
  | "jeopardy"
  | "fill-blank"
  | "verse-order"
  | "lyric-match"
  | "flashcards"
  | "bingo"
  | "memory-match";

export interface GameTypeInfo {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  minSongs: number;
  color: string;
}

// Game settings by type
export interface JeopardySettings {
  categories: {
    name: string;
    questions: {
      points: number;
      clue: string;
      answer: string;
      songId?: string;
    }[];
  }[];
  finalJeopardy?: {
    category: string;
    clue: string;
    answer: string;
  };
}

export interface FillBlankSettings {
  difficulty: "easy" | "medium" | "hard";
  hintMode: boolean;
  timerSeconds?: number;
  wordsToHide: number; // percentage
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

export interface MemoryMatchSettings {
  pairCount: number;
  contentType: "image-text" | "lyric-lyric" | "song-verse";
}

export type GameSettings =
  | JeopardySettings
  | FillBlankSettings
  | VerseOrderSettings
  | LyricMatchSettings
  | FlashcardSettings
  | BingoSettings
  | MemoryMatchSettings;

export interface Game {
  id: string;
  user_id?: string;
  game_type: GameType;
  name: string;
  settings: GameSettings;
  song_ids: string[];
  created_at: string;
  updated_at: string;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      songs: {
        Row: Song;
        Insert: Omit<Song, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Song, "id">>;
      };
      games: {
        Row: Game;
        Insert: Omit<Game, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Game, "id">>;
      };
    };
  };
}
