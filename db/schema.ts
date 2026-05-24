import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type {
  GameSettings,
  GameType,
  SongVerse,
} from "@/lib/types";

// ──────────────────────────────────────────────────────────────────
// Auth.js (NextAuth v5) tables, per @auth/drizzle-adapter spec.
// We add a `password_hash` column on users for the Credentials provider.
// ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => ({
    pk: primaryKey({ columns: [a.provider, a.providerAccountId] }),
    userIdIdx: index("accounts_user_id_idx").on(a.userId),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (s) => ({
    userIdIdx: index("sessions_user_id_idx").on(s.userId),
  })
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ──────────────────────────────────────────────────────────────────
// HymnPlay app tables.
// ──────────────────────────────────────────────────────────────────

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    verses: jsonb("verses").$type<SongVerse[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("songs_user_id_idx").on(t.userId),
    userIdUpdatedIdx: index("songs_user_id_updated_at_idx").on(
      t.userId,
      t.updatedAt
    ),
  })
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameType: text("game_type").$type<GameType>().notNull(),
    name: text("name").notNull(),
    songIds: uuid("song_ids").array().notNull(),
    settings: jsonb("settings").$type<GameSettings>().notNull(),
    lastPlayedAt: timestamp("last_played_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("games_user_id_idx").on(t.userId),
    userIdGameTypeIdx: index("games_user_id_game_type_idx").on(
      t.userId,
      t.gameType
    ),
    userIdLastPlayedIdx: index("games_user_id_last_played_at_idx").on(
      t.userId,
      t.lastPlayedAt
    ),
  })
);

// ──────────────────────────────────────────────────────────────────
// Type exports — Drizzle inference.
// ──────────────────────────────────────────────────────────────────

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;
export type DbSong = typeof songs.$inferSelect;
export type DbSongInsert = typeof songs.$inferInsert;
export type DbGame = typeof games.$inferSelect;
export type DbGameInsert = typeof games.$inferInsert;
