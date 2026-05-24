# Design Document

## Overview

HymnPlay is a single-tenant Next.js 15 (App Router) web application backed by PostgreSQL, designed to run locally on the developer's machine and to migrate to AWS (RDS Postgres + a Next.js host such as Amplify or App Runner) without code changes. The app gives signed-in users a personal library of songs and seven game types they can configure and play.

This document specifies the architecture, schema, route map, module boundaries, and a phased implementation plan that satisfies the requirements in `requirements.md`.

### Top-level technology choices

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Server components, server actions, route handlers, middleware, and `next/font` are all leveraged. Matches the polished v0 mockup. |
| Language | **TypeScript (strict)** | Single source of truth across DB schema, API surface, and UI. |
| Styling | **Tailwind CSS v4** | Tokens defined inline in CSS via `@theme`, no separate config. Matches the mockup's existing `index.css`. |
| Icons | **lucide-react** | Used throughout the polished mockup. |
| Database | **PostgreSQL 16** | JSONB for `verses` and `settings`, native UUID, RDS-compatible. |
| ORM | **Drizzle ORM** + **drizzle-kit** | TS-first, no codegen, plain-SQL migrations checked into the repo. |
| Auth | **Auth.js (NextAuth v5)** with Credentials provider + Drizzle adapter | Email/password against the same Postgres DB. |
| Local infra | **Docker Compose** | One service: postgres. |
| File storage | Local filesystem under `public/uploads/`, behind a thin adapter interface | Swappable to S3 later. |
| Validation | **Zod** | Form input, settings JSON, route-handler request bodies. |
| Drag-and-drop | **@dnd-kit/core** + `@dnd-kit/sortable` | Used by Verse Order and Memory Match creator. |

### Non-goals (recap)

- Cloud deployment, OAuth providers, multiplayer, server-side Claude calls, audio, hymnal import, mobile apps, sharing between users. These are explicitly deferred.

## Architecture

### High-level shape

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser (client)                        │
│   React Server Components rendered server-side, hydrated client │
│   Client components for interactive game play screens           │
└──────────────────────────┬─────────────────────────────────────┘
                           │  HTTP/HTTPS
┌──────────────────────────▼─────────────────────────────────────┐
│                  Next.js 15 server (App Router)                 │
│                                                                 │
│  middleware.ts ──► auth check + redirect for protected routes   │
│                                                                 │
│  app/                       app/api/                            │
│   page.tsx (RSC)             auth/[...nextauth]/route.ts        │
│   songs/                     uploads/route.ts                   │
│   games/[type]/play/[id]/                                       │
│   ...                                                           │
│                                                                 │
│  Server Actions ──► call lib/data/* with userId from session    │
│  Route Handlers ──► same                                        │
│                                                                 │
│  lib/data/{songs,games,users}.ts ──► Drizzle queries            │
│  lib/auth.ts                       ──► NextAuth config          │
│  lib/storage/local.ts              ──► fs writes to public/     │
└──────────────────────────┬─────────────────────────────────────┘
                           │  postgres protocol (5432)
┌──────────────────────────▼─────────────────────────────────────┐
│             PostgreSQL 16 (Docker Compose, local)               │
│                                                                 │
│   Auth.js tables: users, accounts, sessions, verification_token │
│   App tables:     songs, games                                  │
│                                                                 │
│   Migrations applied via drizzle-kit; schema = TS source        │
└────────────────────────────────────────────────────────────────┘

Public-served file tree (Next.js statics):
  public/uploads/<userId>/<uuid>.<ext>   ← user-uploaded card images
```

### Request lifecycle (read example)

1. Browser navigates to `/songs`.
2. `middleware.ts` runs; if no session cookie → redirect to `/sign-in`.
3. `app/songs/page.tsx` (server component) calls `auth()` to read the session, then `listSongs(userId)` from `lib/data/songs.ts`.
4. The data module runs a Drizzle query `SELECT * FROM songs WHERE user_id = $1 ORDER BY updated_at DESC`.
5. Postgres returns rows; the server component renders the page; HTML streams to the browser.
6. Hydration kicks in only for the small interactive bits (search input, action buttons).

### Request lifecycle (write example)

1. User submits the "New Song" form on `/songs/new`.
2. The form is wired to a **server action** `createSongAction(formData)`.
3. The action validates with Zod, calls `auth()` to get `userId`, then calls `createSong(userId, parsed)` from `lib/data/songs.ts`.
4. Drizzle inserts the row, the action calls `revalidatePath('/songs')` and `redirect('/songs')`.

Server actions are the default for mutations. The only route handlers are for cases where a server action doesn't fit: `auth/[...nextauth]/route.ts` (NextAuth requires it) and `uploads/route.ts` (multipart file upload).

## Project structure

The Next.js app lives at the **repo root**. The existing `memory-game/` directory is removed once feature parity is reached. The `v0-mockup/` directory is moved to `docs/v0-mockup/` for archival reference and excluded from the build.

```
matching_game/                       (= bensons_games on GitHub)
├── .env.example                     # DATABASE_URL, AUTH_SECRET, AUTH_URL
├── .gitignore
├── docker-compose.yml               # postgres:16-alpine service
├── drizzle.config.ts                # drizzle-kit config (out=db/migrations)
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
│
├── app/                             # Next.js App Router root
│   ├── layout.tsx                   # html/body, fonts, providers
│   ├── globals.css                  # tailwind v4 @theme tokens
│   ├── page.tsx                     # home (authed)
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── songs/
│   │   ├── page.tsx                 # song library
│   │   ├── new/page.tsx             # song editor (create)
│   │   ├── [id]/edit/page.tsx       # song editor (edit)
│   │   └── import/page.tsx          # Sheet Music Learner
│   ├── games/
│   │   ├── page.tsx                 # game library
│   │   ├── create/page.tsx          # 3-step wizard
│   │   ├── memory-match/play/[id]/page.tsx
│   │   ├── jeopardy/play/[id]/page.tsx
│   │   ├── fill-in-blank/play/[id]/page.tsx
│   │   ├── verse-order/play/[id]/page.tsx
│   │   ├── lyric-match/play/[id]/page.tsx
│   │   ├── flashcards/play/[id]/page.tsx
│   │   └── bingo/play/[id]/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── uploads/route.ts
│
├── components/
│   ├── ui/                          # primitives (button, card, input, label, textarea)
│   ├── navigation.tsx               # auth-aware header
│   ├── page-layout.tsx              # shared shell
│   ├── auth/                        # SignInForm, SignUpForm
│   ├── songs/                       # SongList, SongEditor, VerseEditor
│   ├── games/
│   │   ├── create/                  # StepType, StepSongs, StepSettings + per-type Configure components
│   │   └── play/                    # one folder per game type, with the play screen
│   └── home/                        # Hero, GameTypeGrid, RecentGames, StatsBanner
│
├── lib/
│   ├── auth.ts                      # NextAuth config (handlers, auth, signIn, signOut)
│   ├── auth-actions.ts              # signUpAction, signOutAction
│   ├── game-types.ts                # GAME_TYPES registry + getDefaultSettings
│   ├── types.ts                     # Song, Game, GameType, settings unions
│   ├── data/
│   │   ├── db.ts                    # drizzle client (postgres-js)
│   │   ├── users.ts
│   │   ├── songs.ts
│   │   └── games.ts
│   ├── storage/
│   │   ├── index.ts                 # exports the chosen adapter
│   │   ├── types.ts                 # StorageAdapter interface
│   │   └── local.ts                 # filesystem implementation
│   ├── validation/                  # Zod schemas
│   │   ├── song.ts
│   │   └── game.ts
│   └── utils.ts                     # cn(), formatRelative(), etc.
│
├── db/
│   ├── schema.ts                    # Drizzle schema, single source of truth
│   ├── migrations/                  # drizzle-kit generated SQL files
│   └── seed.ts                      # optional dev-only seed script
│
├── middleware.ts                    # auth redirects
│
├── public/
│   └── uploads/.gitkeep             # filesystem storage root (gitignored beyond .gitkeep)
│
└── docs/
    └── v0-mockup/                   # archived v0 reference (not built)
```

## Data Models

### Database schema (Drizzle)

The schema is defined once in `db/schema.ts`. drizzle-kit generates SQL migrations from it. The shape below combines the **Auth.js Drizzle adapter** standard tables with HymnPlay's app tables.

```ts
// db/schema.ts (shape, not literal)

import { pgTable, uuid, text, timestamp, jsonb, primaryKey, integer } from "drizzle-orm/pg-core";

// ───────── Auth.js tables (per @auth/drizzle-adapter spec) ─────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  passwordHash: text("password_hash"),                 // for Credentials provider
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (a) => ({ pk: primaryKey({ columns: [a.provider, a.providerAccountId] }) }));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({ pk: primaryKey({ columns: [vt.identifier, vt.token] }) }));

// ───────── HymnPlay app tables ─────────

export const songs = pgTable("songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  verses: jsonb("verses").$type<SongVerse[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameType: text("game_type").notNull(),               // GameType enum value, app-validated
  name: text("name").notNull(),
  songIds: uuid("song_ids").array().notNull(),
  settings: jsonb("settings").$type<GameSettings>().notNull(),
  lastPlayedAt: timestamp("last_played_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Indexes

Generated migration SQL adds these indexes (drizzle-kit + manual SQL where needed):

- `users(email)` — unique, used at sign-in.
- `songs(user_id)` — frequent filter.
- `songs(user_id, updated_at desc)` — list ordering.
- `games(user_id)` — frequent filter.
- `games(user_id, game_type)` — game library filtering.
- `games(user_id, last_played_at desc nulls last)` — Continue Playing.
- `accounts(user_id)`, `sessions(user_id)` — Auth.js standard.

### Auto-update of `updated_at`

A single Postgres trigger function reused on `songs` and `games`:

```sql
-- db/migrations/0000_init/extras.sql (hand-authored, applied with drizzle migrations)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_set_updated_at BEFORE UPDATE ON songs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER games_set_updated_at BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

drizzle-kit's `generate` does not produce triggers. We add a hand-authored `0001_triggers.sql` next to the generated migrations and apply it via the same `drizzle-kit migrate` command, which runs each `.sql` file in the migrations folder in lexicographic order.

### Authorization model

Authorization is **application-layer**, enforced in `lib/data/`. Every read/write helper takes `userId` as a required first argument and includes it in `WHERE` for selects and as a default for inserts. There is no public read path.

```ts
// lib/data/songs.ts (illustrative)
export async function listSongs(userId: string): Promise<Song[]> {
  return db.select().from(songs)
    .where(eq(songs.userId, userId))
    .orderBy(desc(songs.updatedAt));
}

export async function getSong(userId: string, id: string): Promise<Song | null> {
  const [row] = await db.select().from(songs)
    .where(and(eq(songs.id, id), eq(songs.userId, userId)));
  return row ?? null;
}

export async function createSong(userId: string, input: SongInput): Promise<Song> {
  const [row] = await db.insert(songs).values({ ...input, userId }).returning();
  return row;
}

export async function updateSong(userId: string, id: string, input: SongInput): Promise<Song | null> {
  const [row] = await db.update(songs)
    .set(input)
    .where(and(eq(songs.id, id), eq(songs.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteSong(userId: string, id: string): Promise<boolean> {
  const res = await db.delete(songs)
    .where(and(eq(songs.id, id), eq(songs.userId, userId)));
  return (res.rowCount ?? 0) > 0;
}
```

When the app moves to AWS later, layering Postgres RLS on top of this is mechanical (CREATE POLICY using a session-set `app.current_user_id`); no app code needs to change.

## Authentication

### Auth.js v5 wiring

```ts
// lib/auth.ts (shape)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./data/db";
import { compare } from "bcrypt";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },                        // simpler than DB sessions for v1
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;
        const user = await getUserByEmail(parsed.data.email);
        if (!user?.passwordHash) return null;
        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) (session.user as any).id = token.userId;
      return session;
    },
  },
});
```

`app/api/auth/[...nextauth]/route.ts` re-exports `handlers.GET` and `handlers.POST`.

### Sign-up flow

Sign-up does **not** go through Auth.js; it's a server action:

```ts
// lib/auth-actions.ts (shape)
"use server";
import { hash } from "bcrypt";
import { signIn } from "./auth";

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) return { error: "Email already in use" };

  const passwordHash = await hash(parsed.data.password, 12);
  await createUser({ email: parsed.data.email, passwordHash });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/",
  });
}
```

### Middleware

```ts
// middleware.ts (shape)
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth;
  const isPublic = PUBLIC_ROUTES.includes(nextUrl.pathname)
    || nextUrl.pathname.startsWith("/api/auth")
    || nextUrl.pathname.startsWith("/_next")
    || nextUrl.pathname.startsWith("/uploads");

  if (!isAuthed && !isPublic) {
    return Response.redirect(new URL("/sign-in", nextUrl));
  }
  if (isAuthed && (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up")) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Note: the home page `/` is reachable while signed-out so unauthenticated visitors see a marketing/landing variant; the same `page.tsx` checks `auth()` server-side and renders either the landing CTA or the personalized home (Requirement 6) accordingly.

## Game type registry

```ts
// lib/game-types.ts (shape)
import type { LucideIcon } from "lucide-react";
import { Trophy, PenLine, ListOrdered, Link2, Layers, Grid3X3, Brain } from "lucide-react";
import type { GameType, GameSettings } from "./types";

export interface GameTypeInfo {
  id: GameType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "coral" | "yellow" | "green" | "purple" | "pink";
  minSongs: number;
  defaultSettings: () => GameSettings;
}

export const GAME_TYPES: Record<GameType, GameTypeInfo> = {
  jeopardy:        { id: "jeopardy",        name: "Jeopardy",          description: "Quiz-style game with categories and points", icon: Trophy,       color: "blue",   minSongs: 3, defaultSettings: () => ({ categories: [] }) },
  "fill-in-blank": { id: "fill-in-blank",   name: "Fill in the Blank", description: "Complete the missing lyrics",               icon: PenLine,      color: "coral",  minSongs: 1, defaultSettings: () => ({ difficulty: "medium", hintMode: true, wordsToHide: 30 }) },
  "verse-order":   { id: "verse-order",     name: "Verse Order",       description: "Put verses in the correct sequence",        icon: ListOrdered,  color: "yellow", minSongs: 1, defaultSettings: () => ({ granularity: "verses", scrambleLevel: "full" }) },
  "lyric-match":   { id: "lyric-match",     name: "Lyric Match",       description: "Match line beginnings to endings",          icon: Link2,        color: "green",  minSongs: 2, defaultSettings: () => ({ pairCount: 6, matchType: "line-halves" }) },
  flashcards:      { id: "flashcards",      name: "Flashcards",        description: "Study cards for memorization",              icon: Layers,       color: "purple", minSongs: 1, defaultSettings: () => ({ flipDirection: "lyric-to-song", studyMode: "sequential", showHints: true }) },
  bingo:           { id: "bingo",           name: "Song Bingo",        description: "Fun group activity with lyrics",            icon: Grid3X3,      color: "pink",   minSongs: 5, defaultSettings: () => ({ cardSize: 5, contentType: "mixed", freeSpace: true }) },
  "memory-match":  { id: "memory-match",    name: "Memory Match",      description: "Classic card matching with hymn content",   icon: Brain,        color: "blue",   minSongs: 1, defaultSettings: () => ({ pairCount: 6, contentType: "lyric-lyric" }) },
};

export const GAME_TYPE_LIST = Object.values(GAME_TYPES);
```

The `id` values are normalized to match URL slugs (`fill-in-blank`, not `fill-blank` as in the v0 type file). Settings types in `lib/types.ts` are renamed to match.


## Route map

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/` | GET | optional | Landing (signed out) or personalized home (signed in) |
| `/sign-in` | GET | public | Sign-in form |
| `/sign-up` | GET | public | Sign-up form |
| `/songs` | GET | required | Song library list |
| `/songs/new` | GET | required | New-song form |
| `/songs/[id]/edit` | GET | required | Edit-song form |
| `/songs/import` | GET | required | Sheet Music Learner |
| `/games` | GET | required | Game library list |
| `/games/create` | GET | required | 3-step create wizard |
| `/games/[type]/play/[id]` | GET | required | Play screen for a saved game (one route per game type) |
| `/api/auth/[...nextauth]` | GET / POST | mixed | NextAuth handlers |
| `/api/uploads` | POST | required | Upload an image for Memory Match |
| `/uploads/<userId>/<file>` | GET | static | Static-served uploaded images |

Server actions (no URL of their own; invoked from forms):

- `signUpAction(formData)`
- `signOutAction()` — wraps `signOut()` from `lib/auth.ts`
- `createSongAction`, `updateSongAction`, `deleteSongAction`
- `createGameAction`, `updateGameAction`, `deleteGameAction`
- `recordGamePlayedAction(gameId)` — sets `last_played_at = now()`

## Components and Interfaces

### Component architecture

### Shared shell

```
<RootLayout>
  <body class="font-nunito bg-background text-foreground">
    <SessionProvider>          # Auth.js client wrapper
      <Navigation />            # auth-aware header (logo, links, user menu)
      <main>{children}</main>
    </SessionProvider>
  </body>
</RootLayout>
```

`<Navigation>` is a server component that calls `auth()` to decide what to render: signed-out shows "Sign in / Sign up"; signed-in shows nav links + user menu with a sign-out form (server action button).

`<PageLayout>` (from `v0-mockup/components/page-layout.tsx`) is the inner wrapper with max-width and padding rules used by content pages. It is purely presentational.

### UI primitives (`components/ui/`)

Ported from `v0-mockup/components/ui/` and verified against the polished mockup's class usage:

- `Button` — `variant: "primary" | "secondary" | "ghost" | "danger"`, `size: "sm" | "md" | "lg"`, supports `asChild` for use as a Link.
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Input`, `Textarea`, `Label`
- `Badge` (for the "X games saved" pill on game-type cards)
- `ProgressSteps` (for the create-game wizard)

Each primitive is a thin wrapper around an HTML element with `cn()` (the standard `clsx` + `tailwind-merge` combo) for class composition.

### Per-feature component trees

**Home (`app/page.tsx`)**

```
HomePage (RSC)
├── HeroSection
├── GameTypeGrid                # iterates GAME_TYPE_LIST
├── ContinuePlaying              # client; fetches 3 most recent games via RSC parent
└── StatsBanner                  # counts from data layer
```

**Songs (`app/songs/page.tsx`)**

```
SongsPage (RSC)
└── SongList                     # client (search input + filter)
    └── SongCard*                # name, verse count, edit/create-game actions
```

**Song editor (`app/songs/new/page.tsx`, `[id]/edit/page.tsx`)**

```
SongEditorPage (RSC, fetches existing if id)
└── SongEditorForm (client)
    ├── TitleInput
    ├── VerseEditor*             # add/remove/reorder verses
    │   └── LineList             # textarea per line
    └── SaveBar                  # uses createSongAction / updateSongAction
```

**Sheet Music Learner (`app/songs/import/page.tsx`)**

The existing `SheetMusicLearner.jsx` is ported as one large client component. It keeps all of its current logic (PDF rendering, Anthropic API call, drag-edit verses, hide-random-words mode) and saves via `createSongAction`. The Anthropic API key continues to be cached in `localStorage`.

**Create-game wizard (`app/games/create/page.tsx`)**

```
CreateGameWizardPage (RSC, fetches user's songs and existing game-type counts)
└── CreateGameWizard (client)
    ├── ProgressSteps
    ├── StepType                 # GAME_TYPE_LIST → cards
    ├── StepSongs                # checkbox list, validates minSongs
    └── StepSettings
        ├── ConfigureJeopardy
        ├── ConfigureFillInBlank
        ├── ConfigureVerseOrder
        ├── ConfigureLyricMatch
        ├── ConfigureFlashcards
        ├── ConfigureBingo
        └── ConfigureMemoryMatch  # includes ImageUploader for image-content type
```

The wizard holds its state (`type`, `songIds`, `settings`, `name`) in a single React reducer. On submit, it calls `createGameAction` and navigates to `/games/<type>/play/<id>`.

**Per-game-type play screens** (`app/games/<type>/play/[id]/page.tsx`)

Each is a thin RSC that:
1. Calls `auth()` and `getGame(userId, id)`.
2. Fetches the referenced `getSongsByIds(userId, songIds)`.
3. Renders the corresponding `<TypePlay>` client component with the data and settings.
4. Fires `recordGamePlayedAction(id)` once on mount via a small client effect.

The play components live in `components/games/play/<type>/` and are individually responsible for the gameplay state machine. The visual treatments (color palette, header, badges) match the corresponding `*Page` mockup in `v0-mockup/memory-game/src/main.jsx`.

### Data-access module surface

```ts
// lib/data/users.ts
getUserByEmail(email): Promise<User | null>
getUserById(id): Promise<User | null>
createUser({ email, passwordHash }): Promise<User>

// lib/data/songs.ts
listSongs(userId): Promise<Song[]>
getSong(userId, id): Promise<Song | null>
getSongsByIds(userId, ids): Promise<Song[]>
createSong(userId, input): Promise<Song>
updateSong(userId, id, input): Promise<Song | null>
deleteSong(userId, id): Promise<boolean>
countSongs(userId): Promise<number>

// lib/data/games.ts
listGames(userId, opts?: { gameType?, limit? }): Promise<Game[]>
listRecentGames(userId, limit): Promise<Game[]>      // for Continue Playing
getGame(userId, id): Promise<Game | null>
createGame(userId, input): Promise<Game>
updateGame(userId, id, input): Promise<Game | null>
deleteGame(userId, id): Promise<boolean>
recordGamePlayed(userId, id): Promise<void>          // SET last_played_at = now()
countGames(userId): Promise<number>
findGamesReferencingSong(userId, songId): Promise<Game[]>  // for delete-warning
```

The Drizzle client itself is constructed once in `lib/data/db.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const queryClient = postgres(process.env.DATABASE_URL!, { max: 10 });
export const db = drizzle(queryClient, { schema });
```

### Storage adapter

```ts
// lib/storage/types.ts
export interface StorageAdapter {
  saveFile(opts: {
    userId: string;
    buffer: Buffer;
    contentType: "image/png" | "image/jpeg" | "image/webp";
    extension: "png" | "jpg" | "webp";
  }): Promise<{ key: string; url: string }>;
  deleteFile(key: string): Promise<void>;
}
```

```ts
// lib/storage/local.ts (shape)
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = path.join(process.cwd(), "public", "uploads");

export const localStorage: StorageAdapter = {
  async saveFile({ userId, buffer, extension }) {
    const dir = path.join(ROOT, userId);
    await fs.mkdir(dir, { recursive: true });
    const id = randomUUID();
    const filename = `${id}.${extension}`;
    await fs.writeFile(path.join(dir, filename), buffer);
    return { key: `${userId}/${filename}`, url: `/uploads/${userId}/${filename}` };
  },
  async deleteFile(key) {
    const target = path.join(ROOT, key);
    if (target.startsWith(ROOT)) await fs.rm(target, { force: true });
  },
};
```

`lib/storage/index.ts` exports `localStorage` as `storage`. To swap to S3 later, write `s3.ts`, change one import.

The upload **route handler** at `app/api/uploads/route.ts`:

1. Calls `auth()` and rejects unauthenticated requests with 401.
2. Reads `formData()`, gets the file blob.
3. Validates content type (`image/png`, `image/jpeg`, `image/webp`) and size (≤ 5 MB).
4. Streams to a Node `Buffer`.
5. Calls `storage.saveFile({ userId, buffer, contentType, extension })`.
6. Returns `{ url, key }` as JSON.

Client-side compression (the existing tier-based fallback from `GameCreator.jsx`) runs **before** the upload, so the byte size hitting the server is already shrunk.

### Validation

Zod schemas live in `lib/validation/` and are used in three places:

1. **Form server actions** — parse `FormData` shapes.
2. **Route handlers** — parse JSON request bodies.
3. **Settings** stored on `games.settings` — validated on every create/update so malformed JSON cannot land in the DB.

Per-game-type settings schemas mirror the discriminated union from `lib/types.ts`:

```ts
const jeopardySettings = z.object({ /* … */ });
const fillInBlankSettings = z.object({ /* … */ });
// …
export const gameSettingsByType = {
  "jeopardy": jeopardySettings,
  "fill-in-blank": fillInBlankSettings,
  // …
};

export function parseGameSettings(type: GameType, raw: unknown) {
  return gameSettingsByType[type].parse(raw);
}
```

## Correctness Properties

These are invariants the implementation must preserve. They guide code review and serve as the basis for any tests we eventually add.

### Property 1: No cross-tenant reads or writes

**Validates: Requirements 3.7, 3.9**

Every function in `lib/data/songs.ts` and `lib/data/games.ts` that touches user-owned rows takes `userId` as a required first argument and includes `WHERE user_id = $userId` in selects, or sets `user_id = $userId` on inserts. There is no public function that returns rows owned by another user.

### Property 2: No data-layer access from components

**Validates: Requirements 3.9**

Pages, components, and route handlers never import `db` or Drizzle helpers directly. All access goes through `lib/data/*` modules. This keeps the authorization invariant in one place.

### Property 3: Session-driven `userId`

**Validates: Requirements 2.7, 3.7**

The `userId` passed to data functions always originates from `auth()` session, never from the request body, query string, or path. Path params identify *which row* to act on, not *which user*.

### Property 4: Sign-up cannot duplicate emails

**Validates: Requirements 2.3**

`users.email` has a unique constraint; `signUpAction` also performs an explicit pre-check for a clearer user-facing error message.

### Property 5: Settings JSON matches its game type

**Validates: Requirements 3.6, 7.4**

Every `createGame` and `updateGame` call validates `settings` through the type-keyed Zod schema. Malformed settings cannot land in the database.

### Property 6: `song_ids` references real songs at write time

**Validates: Requirements 3.7, 4.8, 7.5**

`createGame` and `updateGame` validate that every UUID in `song_ids` corresponds to a song owned by the same user. Songs deleted later may leave dangling references; the play screens are responsible for handling missing songs gracefully (see Error Handling).

### Property 7: `updated_at` always reflects last write

**Validates: Requirements 3.8**

Enforced by Postgres trigger (see schema section), so any update path — even one that bypasses the data-access layer — is covered.

### Property 8: Filesystem keys never escape the uploads root

**Validates: Requirements 20.2, 20.6**

The storage adapter rejects keys whose resolved path falls outside `public/uploads/`. This guards against path-traversal in any future code path that takes a user-supplied key.

### Property 9: No game-type entry hardcoded outside the registry

**Validates: Requirements 5.3, 5.4**

Adding a new game type is a one-file change to `lib/game-types.ts` plus the new play route and configure component. Home, library, and wizard render from the registry only.

### Property 10: Wizard step gating

**Validates: Requirements 7.3**

The "Continue" action on Step 2 of the create-game wizard is disabled (not just visually muted) until `selectedSongs.length >= GAME_TYPES[type].minSongs`.

### Property 11: Auth.js session shape

**Validates: Requirements 2.1, 2.7**

Server components and server actions can rely on `(await auth())?.user.id` being a non-empty string for any authenticated request. The JWT callback ensures `token.userId` is always set; the session callback always copies it to `session.user.id`.

## Error Handling

### Server action error model

Server actions return a plain `{ ok: true } | { ok: false, error: string }` shape (or throw for genuinely exceptional conditions like DB connection loss). Forms display the `error` next to the relevant field or as a top-of-form message. Successful actions either return `{ ok: true }` or `redirect()`.

| Failure | Action | UX |
|---|---|---|
| Validation failure (Zod) | Return `{ ok: false, error: <field-keyed message> }` | Inline error under the field |
| Auth required but missing | `redirect("/sign-in")` | Browser navigates |
| Row not found / not owned | Return `{ ok: false, error: "Not found" }` | Friendly toast + back to list |
| Unique-constraint violation (e.g. duplicate email at sign-up) | Catch by error code, return user-facing message | Inline form error |
| Unexpected DB error | Re-throw | Next.js error boundary renders `error.tsx` |

### Route handler error model

`app/api/uploads/route.ts` returns standard HTTP responses:

- `401` — unauthenticated.
- `400` — missing file, wrong content type, file too large.
- `500` — unexpected error (caught and logged).
- `200` — success, JSON body `{ url, key }`.

### Sheet Music Learner error model (preserved)

The existing component already has tiered error handling for: PDF parse failure, missing or invalid Anthropic key, API rate limits, AI returning malformed JSON. All of these surface as `setError(message)` and a "Try Again" button, exactly as today.

### Play-screen error model

Each play page server-fetches the game and its referenced songs. If `getGame()` returns null (deleted, or wrong owner), the page renders a friendly "Game not found" with a link back to `/games`. If the game's `song_ids` resolve to fewer songs than expected (a referenced song was deleted), the page renders a recoverable warning ("This game references a song that no longer exists. Edit the game to choose a replacement.") with an "Edit" link, instead of crashing.

### Database connection failure

Drizzle / `postgres-js` throw on connection loss. Next.js's nearest `error.tsx` boundary catches the throw and renders a generic "Something went wrong" page with a retry. The error itself is logged server-side (no PII in logs).

### Boundary file layout

```
app/
  error.tsx                    # global; "Something went wrong"
  not-found.tsx                # global 404
  songs/
    [id]/
      edit/
        not-found.tsx          # "Song not found"
  games/
    [type]/
      play/
        [id]/
          not-found.tsx        # "Game not found"
```

## Testing Strategy

Per the user's instruction in this spec workflow, automated tests are **not added in v1**. The intent is to ship working software fast and use manual smoke-testing during development.

This section captures the strategy we *will* adopt when tests are eventually added, so the codebase is structured to support them.

### Future test layers

1. **Unit tests (Vitest).** Pure logic — game-type validation schemas, lyric tokenization for Fill in the Blank, win-detection for Bingo, Memory Match shuffle determinism with a seeded RNG. These have no DB or React dependency.
2. **Data-access tests (Vitest + a real Postgres).** Tests that hit a separate `hymnplay_test` database, started from the same `docker-compose.yml` with a different name, with migrations applied per test run. Cover the authorization invariants from the Correctness Properties section directly.
3. **Component tests (Testing Library).** Forms (`SongEditorForm`, `SignInForm`), the wizard reducer, individual play-screen state machines.
4. **End-to-end (Playwright).** Two happy-path flows: (a) sign up → create song → create memory match game → play to win; (b) sign up → upload sheet music → save song.

### Manual smoke checks per phase (used now)

At the end of each phase in the implementation plan, the developer manually verifies:

- `npm run build` succeeds with zero TS errors.
- `npm run dev` starts cleanly.
- The phase's "Definition of done" steps pass when clicked through.
- Restarting the postgres container preserves data; recreating the volume requires re-running migrations cleanly.

### Forward-compatibility check

Before declaring the project done locally, run the full app once with `DATABASE_URL` pointed at a fresh Docker Postgres instance to confirm the migration-from-empty-DB path works end to end. This is the proxy for "will this work against AWS RDS later".

## Visual design system

Tokens are declared once in `app/globals.css` using Tailwind v4's `@theme` (matching `v0-mockup/memory-game/src/index.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
@import 'tailwindcss';

@theme inline {
  --font-sans: 'Nunito', system-ui, sans-serif;
  --color-primary: #4A90D9;
  --color-background: #FFF9F0;
  --color-foreground: #2D3748;
  --color-muted: #F0EDE8;
  --color-muted-foreground: #6B7280;
  --color-card: #FFFFFF;
  --color-border: #E5E1DC;
  --color-game-blue:   #4A90D9;
  --color-game-coral:  #FF7B54;
  --color-game-yellow: #FFD93D;
  --color-game-green:  #6BCB77;
  --color-game-purple: #9B59B6;
  --color-game-pink:   #E91E63;
  --radius-soft: 1rem;
  --radius-card: 1.5rem;
  --shadow-soft: 0 4px 20px rgba(0,0,0,0.08);
}
```

Nunito is loaded via `next/font/google` for self-hosting in addition to (or instead of) the `@import` URL — `next/font` is preferred for performance.

## Migration plan from the existing app

The current `memory-game/` Vite app is preserved on disk during the build-out and removed at the end. The strategy is **fresh rewrite, not in-place port**, because every file is changing language (JS → TS) or framework (Vite + react-router → Next.js) anyway.

| Existing file | Fate |
|---|---|
| `src/utils/storage.js` | Deleted. Replaced by `lib/data/{songs,games}.ts`. |
| `src/pages/Home.jsx` + `Home.css` | Replaced by `app/page.tsx` + Tailwind classes. |
| `src/pages/SongLibrary.jsx` + `.css` | Replaced by `app/songs/page.tsx`. |
| `src/pages/GameLibrary.jsx` + `.css` | Replaced by `app/games/page.tsx`. |
| `src/pages/GameCreator.jsx` + `.css` | Logic split: image upload + position drag → `components/games/create/ConfigureMemoryMatch.tsx` + `components/games/play/memory-match/` shared bits. The progressive-compression tier loop is preserved verbatim in TS. |
| `src/pages/GamePlay.jsx` + `.css` | Replaced by `components/games/play/memory-match/PlayMemoryMatch.tsx` + `app/games/memory-match/play/[id]/page.tsx`. |
| `src/pages/SheetMusicLearner.jsx` + `.css` | Ported as `app/songs/import/page.tsx`. JSX kept largely intact, retyped, styles converted to Tailwind classes. The Claude API call, PDF rendering, and edit-mode drag/drop logic are preserved verbatim. |
| `src/App.jsx`, `App.css`, `main.jsx`, `index.css` | Deleted. Replaced by Next.js layout + globals. |
| `vite.config.js`, `eslint.config.js` | Deleted. Next.js + ESLint config replace them. |
| `public/vite.svg` | Deleted. |
| `package.json` | Replaced. New deps: `next`, `react`@19, `tailwindcss`@4, `@tailwindcss/postcss`, `lucide-react`, `drizzle-orm`, `drizzle-kit`, `postgres`, `next-auth`@5, `@auth/drizzle-adapter`, `bcrypt`, `@types/bcrypt`, `zod`, `@dnd-kit/core`, `@dnd-kit/sortable`, `pdfjs-dist`, `tesseract.js` (kept), `clsx`, `tailwind-merge`. Removed: `react-router-dom`, `vite`, `@vitejs/plugin-react`, `uuid` (replaced by `crypto.randomUUID()`). |

The single piece of legacy data the migration must contemplate is **localStorage data** any current users (just you) might have. Since there is no user-facing app deployed and the existing app is single-user-on-one-browser, no migration script is required. If desired, a one-shot dev-only `db/seed.ts` can read from a JSON dump for convenience.

## Phased implementation plan

The work is sequenced so each phase produces a runnable app. Each phase ends with `npm run build && npm run dev` succeeding.

### Phase 0 — Workspace cleanup and skeleton

- Move `v0-mockup/` to `docs/v0-mockup/` (or delete after extracting the few reference files we keep).
- Delete the root-level `package-lock.json` artifact and the `.DS_Store`. Move `.vscode/settings.json` into the new repo root if useful.
- Delete `memory-game/` **only after** Phase 4 reaches feature parity. Until then, leave it untouched.
- `npm create next-app@latest .` (TypeScript, Tailwind, App Router, no ESLint preset overrides).
- Manually merge the generated `.gitignore` into the root one written earlier.
- Set up `tsconfig.json` with `paths: { "@/*": ["./*"] }`.

### Phase 1 — Local DB + Auth foundation

- `docker-compose.yml` with `postgres:16-alpine` + named volume.
- `db/schema.ts` (full schema as designed above).
- `drizzle.config.ts` pointing at `db/schema.ts` and `db/migrations/`.
- npm scripts: `db:generate`, `db:migrate`, `db:studio`.
- Generate first migration; add hand-authored `0001_triggers.sql`; apply.
- Install Auth.js v5 + Drizzle adapter + bcrypt; build `lib/auth.ts`, `lib/auth-actions.ts`.
- `app/sign-in/page.tsx` and `app/sign-up/page.tsx` with minimal styled forms.
- `middleware.ts` with the redirect logic.
- `app/api/auth/[...nextauth]/route.ts`.

**Definition of done**: a developer can `docker-compose up -d`, `npm run db:migrate`, `npm run dev`, sign up at `/sign-up`, see they're redirected to `/`, sign out, sign in again. The home page is a placeholder.

### Phase 2 — Design system + shared shell

- `app/globals.css` with the `@theme` tokens.
- `components/ui/` primitives ported from the v0 mockup, Tailwind classes verified.
- `components/navigation.tsx` and `components/page-layout.tsx`.
- Replace the placeholder home with the polished mockup home (hero, game-type grid using the registry, stats banner — stats can be hardcoded zeros until Phase 3 wires the data).

**Definition of done**: a signed-in user sees the mockup home and can navigate to `/songs` and `/games` (both stubs).

### Phase 3 — Songs feature end-to-end

- `lib/data/songs.ts` complete.
- `lib/validation/song.ts` Zod schemas.
- Song server actions: `createSongAction`, `updateSongAction`, `deleteSongAction`.
- `app/songs/page.tsx` + `SongList` with search.
- `app/songs/new/page.tsx` and `app/songs/[id]/edit/page.tsx` with `SongEditorForm`, `VerseEditor` using `@dnd-kit/sortable` for verse reordering.
- Empty-state UI.
- Wire stats banner real song count.

**Definition of done**: sign in, create a song, edit it, delete it, search the library. Data survives container restarts.

### Phase 4 — Sheet Music Learner port

- `app/songs/import/page.tsx` with the existing learner ported to TS, styled with Tailwind.
- "Save Song" calls `createSongAction`.
- "Create from Scratch" routes to `/songs/new`.
- License/privacy disclaimer.

**Definition of done**: upload a PDF, get lyrics extracted (with your Anthropic key), edit, save, see it in `/songs`.

### Phase 5 — Memory Match (port + storage adapter)

- `lib/storage/{types,local,index}.ts`.
- `app/api/uploads/route.ts`.
- `lib/data/games.ts` complete.
- `lib/validation/game.ts` Zod schemas including settings unions.
- Game server actions.
- `app/games/page.tsx` (game library; only Memory Match games show up at this point).
- `app/games/create/page.tsx` wizard with only the Memory Match path implemented.
- `ConfigureMemoryMatch` component with image uploader (uses `/api/uploads`) + drag-to-reposition logic ported from `GameCreator.jsx`.
- `app/games/memory-match/play/[id]/page.tsx` + `PlayMemoryMatch` client component.

**Definition of done**: create a Memory Match game with a mix of text and uploaded images, play it, win, see stats update.

At this point the legacy `memory-game/` directory is **deleted**. The new app has parity with the old app plus Songs persistence, plus auth, plus the new design system.

### Phase 6 — Remaining six game types

Each game type is its own sub-phase with the same shape: settings Zod schema → `Configure<Type>` component in the wizard → `Play<Type>` client component → play route page. Suggested order, easiest first:

1. Flashcards (single-card UI, simplest gameplay)
2. Lyric Match (two-column matching)
3. Verse Order (drag-and-drop reorder)
4. Fill in the Blank (lyric tokenization, blank-filling)
5. Bingo (grid + win detection)
6. Jeopardy (richest configure UI; team scores; modal flow)

**Definition of done at end of Phase 6**: every game-type card on the home grid leads to a working create + play loop.

### Phase 7 — Polish

- Continue Playing row on home (real `last_played_at` data).
- "Delete song" warning that lists referencing games (Requirement 4.8).
- Edit-game flow that reopens the wizard at step 3.
- `db:seed` script with two example songs for local dev.
- Final pass on responsiveness (375px viewport check).
- README finalized with setup, scripts, reset-DB, and AWS-future notes.

## Open design questions

These are surfaced before we move to tasks.

1. **Auth.js session strategy:** the design uses **JWT sessions** (not DB sessions). Pros: faster, no `sessions` table writes on every request, simpler. Cons: revoking a single session requires rotating `AUTH_SECRET`. For a single-user local app this is the right tradeoff, but flag if you want DB sessions instead.
2. **`emailVerified` flow:** Auth.js's `users.emailVerified` column is included in the schema for compatibility, but no verification email is sent in v1. New users are immediately able to sign in. OK to defer email verification?
3. **Anthropic API key in production:** the spec preserves the BYO-key, browser-`localStorage` model from the existing app. When this app eventually runs on AWS, that's still fine for personal use, but if the app ever gains additional users, we'd want to move this server-side and bill per-user. Flagging only — no change for v1.
4. **Form library:** none. Forms use raw `<form action={serverAction}>` with `useFormStatus` for pending state. Adding `react-hook-form` + `@hookform/resolvers/zod` is overkill for the form complexity here. Confirm or push back.
5. **Tests:** the spec did not call for tests, and per workspace defaults I won't add a test runner unless asked. Flag if you want at least a smoke test (Playwright + a single happy-path E2E) added in a later phase.
