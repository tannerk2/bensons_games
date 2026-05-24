# Requirements Document

## Introduction

HymnPlay is a learning app that turns hymns and worship songs into interactive games. Today the project is a small Vite + React app called `memory-game` with a single Memory Match game type, a sheet-music OCR tool that uses the Anthropic API to extract lyrics from PDFs, and `localStorage`-based persistence.

This spec covers a full refactor and expansion: migrate to **Next.js 15+ (App Router) + TypeScript + Tailwind v4**, replace `localStorage` with **PostgreSQL (run locally via Docker Compose)** managed through **Drizzle ORM**, add **Auth.js (NextAuth v5)** for email/password authentication, and implement **seven game types** (Jeopardy, Fill in the Blank, Verse Order, Lyric Match, Flashcards, Song Bingo, Memory Match) using the polished mockup in `v0-mockup/app/` as the design reference. The existing Sheet Music Learner with PDF/OCR is preserved as the primary on-ramp for getting song lyrics into the library.

The deployment target for this spec is **local development only**. Hosting on AWS (RDS Postgres for the database, Amplify/App Runner/ECS for the app) is an explicit future direction that informs technology choices but is out of scope here.

The end state is a multi-user web app, runnable on the developer's machine, where signed-in users can build a personal library of songs (typed in, or extracted from sheet music via Claude), then generate and play any of the seven game types from that library.

## Glossary

- **Song**: a hymn or worship song stored as a title plus an ordered list of verses, where each verse has an optional title (e.g. "Verse 1", "Chorus") and an array of lyric lines.
- **Game**: a saved, configured instance of one of the seven game types, bound to one or more songs and a settings object that controls how it plays.
- **Game type**: one of the seven gameplay modes (Jeopardy, Fill in the Blank, Verse Order, Lyric Match, Flashcards, Song Bingo, Memory Match).
- **Game type registry**: the canonical definition (in `lib/game-types.ts`) of all seven game types — id, display name, description, icon, color, minimum song count, and default settings.
- **Sheet Music Learner**: the existing tool that uploads a PDF or image of sheet music, sends it to the Anthropic Claude API, and returns structured verses/lines that become a Song.
- **Owner**: the authenticated user who created a Song or Game. By application-layer authorization, owners are the only users who can read or write their own rows.
- **Local development environment**: PostgreSQL running in a Docker container on the developer's machine, accessed by Next.js via a connection string in `.env.local`.

## Out of scope

The following are explicitly not part of this refactor and may be addressed in a future spec:

- Sharing songs or games between users (every row is private to its owner).
- Multiplayer or real-time co-play (Jeopardy team scoring is local to one device).
- Moving the Anthropic API call server-side. The existing client-side, BYO-API-key flow is preserved as-is.
- Mobile native apps. Target is responsive web only.
- Offline / PWA support beyond what Next.js gives by default.
- Importing songs from external hymnal databases.
- Music playback (audio) of any kind.
- **Cloud deployment.** This spec only delivers a locally-runnable app. Migrating the database to AWS RDS and the app to AWS hosting (Amplify, App Runner, or ECS) is a separate future spec.
- OAuth providers (Google, GitHub, etc.). Email/password is the only auth method for v1.

## Requirements

### Requirement 1: Stack migration to Next.js + TypeScript

**User Story:** As a developer continuing this project, I want a single, modern, type-safe stack so I can ship features without fighting two parallel codebases.

#### Acceptance Criteria

1. WHEN the refactor is complete THEN the `memory-game/` directory SHALL be replaced by a Next.js 15+ App Router project at the repo root (or in a single top-level app directory) using TypeScript in strict mode.
2. The project SHALL use Tailwind CSS v4 configured with the design tokens from `v0-mockup/memory-game/src/index.css` (Nunito font, kid-friendly color palette, soft shadows, rounded radii).
3. The project SHALL use `lucide-react` for icons, matching the polished mockup in `v0-mockup/app/page.tsx`.
4. WHEN a developer runs `npm run dev` THEN the app SHALL start in development mode with hot reload.
5. WHEN a developer runs `npm run build` THEN the app SHALL produce a successful production build with no TypeScript errors.
6. The legacy Vite app SHALL be removed once the Next.js port reaches feature parity for everything in this spec.
7. The `v0-mockup/` directory SHALL be removed (or moved to a `docs/` archive) once its contents have been migrated into the live app.
8. The two existing root-level artifacts that don't belong (`/.DS_Store`, `/package-lock.json`, `/.vscode/`) SHALL be cleaned up or moved into the app directory as appropriate.

### Requirement 2: Authentication with Auth.js (email/password)

**User Story:** As a user of HymnPlay, I want to sign in to the app so that my song library and saved games are private to me and follow me across devices on the same machine.

#### Acceptance Criteria

1. The app SHALL use **Auth.js (NextAuth v5)** with the **Credentials provider** for email/password authentication, and the **Drizzle adapter** so that user, account, and session records persist in the same PostgreSQL database used for app data (Requirement 3).
2. Passwords SHALL be hashed using **bcrypt** (cost factor ≥ 10) before storage. Plaintext passwords SHALL never be written to the database or to logs.
3. The app SHALL expose `/sign-up` and `/sign-in` routes with simple email + password forms. Sign-up SHALL validate that the email is well-formed, the password is at least 8 characters, and the email is not already in use.
4. WHEN a user is not authenticated AND the user requests any route except `/`, `/sign-in`, `/sign-up`, or static assets THEN the app SHALL redirect them to `/sign-in`.
5. WHEN a user is authenticated AND the user requests `/sign-in` or `/sign-up` THEN the app SHALL redirect them to `/`.
6. WHEN a user signs out THEN the app SHALL clear the session, redirect to `/`, and prevent further access to authenticated routes until sign-in.
7. The app SHALL use Next.js middleware (`middleware.ts`) to enforce authentication redirects on protected routes.
8. WHILE a user is signed in, every authenticated page SHALL display their email in a header user menu, with a sign-out action.
9. Adding additional providers (Google, GitHub, etc.) in a future spec SHALL require only adding a provider config to the Auth.js setup, without schema migrations beyond the standard Auth.js account table that is already provisioned.
10. Auth.js secrets (`AUTH_SECRET`) SHALL be loaded from environment variables and SHALL NOT be committed to the repo.

### Requirement 3: Data model and persistence (PostgreSQL + Drizzle)

**User Story:** As a user, I want my songs and games stored in a real database so that they persist beyond browser cache and aren't lost if I clear local data.

#### Acceptance Criteria

1. The app SHALL use **PostgreSQL** as its database. PostgreSQL SHALL run locally via **Docker Compose** during development (see Requirement 19).
2. The app SHALL use **Drizzle ORM** for schema definition, queries, and migrations. The Drizzle schema SHALL be defined in TypeScript under `db/schema.ts` and SHALL be the single source of truth for the database structure.
3. The schema SHALL include the following application tables:
   - `songs(id uuid pk default gen_random_uuid(), user_id uuid not null fk users, title text not null, verses jsonb not null, created_at timestamptz default now(), updated_at timestamptz default now())`
   - `games(id uuid pk default gen_random_uuid(), user_id uuid not null fk users, game_type text not null, name text not null, song_ids uuid[] not null, settings jsonb not null, last_played_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now())`
4. The schema SHALL also include the standard Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`) as defined by the Drizzle adapter, plus a `password_hash` column on `users` for the Credentials provider. The `users.id` SHALL be the foreign key target for `songs.user_id` and `games.user_id` with `ON DELETE CASCADE`.
5. The `verses` jsonb column SHALL match the `SongVerse[]` shape from `v0-mockup/lib/types.ts`: `[{ title?: string, lines: string[] }]`.
6. The `settings` jsonb column SHALL match the discriminated union of game-type-specific settings from `v0-mockup/lib/types.ts` (`JeopardySettings | FillBlankSettings | VerseOrderSettings | LyricMatchSettings | FlashcardSettings | BingoSettings | MemoryMatchSettings`).
7. Authorization SHALL be enforced at the **application layer**: every read/write to `songs` or `games` SHALL filter by the authenticated `user_id` from the session. There SHALL be no path in the data-access layer that returns rows owned by another user. (RLS at the database layer is out of scope; revisit when moving to AWS.)
8. WHEN a row is updated THEN `updated_at` SHALL be updated to `now()`. This SHALL be implemented either via a Postgres trigger (preferred) or consistently in the data-access layer.
9. The app SHALL include a single, typed data-access module (e.g. `lib/data/songs.ts`, `lib/data/games.ts`, `lib/data/users.ts`) that wraps all database calls and accepts the current `userId` as a required parameter on every read/write of user-owned rows. Components and route handlers SHALL NOT call Drizzle directly except through this layer.
10. There SHALL be NO usage of `localStorage` for songs or games anywhere in the app. The only `localStorage` usage permitted is the existing Anthropic API key cache in the Sheet Music Learner (Requirement 9).
11. The legacy `utils/storage.js` SHALL be removed.
12. Database migrations SHALL be managed by **drizzle-kit**. Generated SQL migration files SHALL be checked into the repo under `db/migrations/`. Running `npm run db:migrate` against a fresh PostgreSQL database SHALL produce the full schema.
13. The migration files generated by drizzle-kit SHALL be portable to AWS RDS Postgres without modification.

### Requirement 4: Song library and song editor

**User Story:** As a user, I want to manage a personal library of songs and create or edit them so that I have a reusable pool of content for my games.

#### Acceptance Criteria

1. WHEN a signed-in user visits `/songs` THEN the app SHALL list all songs they own, showing each song's title, verse count, and last-updated time, with a search box that filters by title.
2. WHEN the song list is empty THEN the app SHALL show an empty state that invites the user to add their first song, with primary actions for "Add manually" and "Upload sheet music".
3. WHEN the user clicks "Add Song" THEN the app SHALL navigate to `/songs/new` with a form to enter title, verses, and an optional chorus.
4. WHEN the user clicks "Edit" on a song THEN the app SHALL navigate to `/songs/[id]/edit` with the same form pre-populated.
5. The song editor SHALL allow adding, removing, and reordering verses, and editing each verse's title and lines.
6. WHEN the user saves a song with a missing title or zero verses THEN the app SHALL block save and surface a validation message.
7. WHEN a song is saved THEN the app SHALL persist it via the data-access module (Requirement 3) and redirect back to `/songs`.
8. WHEN the user deletes a song that is referenced by a game's `song_ids` THEN the app SHALL warn that the affected games may break, list those games by name, and require confirmation before deleting. The game rows themselves SHALL NOT be cascade-deleted.

### Requirement 5: Game type registry

**User Story:** As a developer adding new game types in the future, I want all game-type metadata defined in one place so that the home page, creator wizard, and play routes stay consistent.

#### Acceptance Criteria

1. The app SHALL include a `lib/game-types.ts` module that exports a `GAME_TYPES` record keyed by game type id, matching the structure already defined in `v0-mockup/lib/game-types.ts`.
2. Each entry SHALL include: `id`, `name`, `description`, `icon` (a `lucide-react` component reference or icon name), `color` (a Tailwind class or design-token reference), `minSongs` (minimum songs required to create this game type), and a `getDefaultSettings()` factory.
3. The home page, the create-game wizard, and any game listing UI SHALL render game-type cards purely from this registry, not from hardcoded arrays.
4. Adding a new game type in the future SHALL require: (a) appending an entry to `GAME_TYPES`, (b) extending the `GameSettings` union, (c) creating the play route, and (d) creating the configure step. No other UI files should need editing to make the new type appear in lists.

### Requirement 6: Home page

**User Story:** As a user landing on the app, I want a welcoming overview that gets me quickly to creating a game, browsing my songs, or jumping back into a recent game.

#### Acceptance Criteria

1. WHEN a signed-in user visits `/` THEN the app SHALL render a home page that visually matches `v0-mockup/app/page.tsx`, including: a sticky header with brand mark and nav, a hero section with primary CTAs ("Create a Game", "Add Songs"), a grid of all seven game-type cards driven by the registry, a "Continue Playing" row of the user's three most recently played games, and a stats banner.
2. The stats banner SHALL show real, live counts: songs added, games created, games played, and game-type count. "Games played" MAY be derived from a `last_played_at` field added later — initial implementation MAY count games where `last_played_at IS NOT NULL`, or display "—" until that data exists.
3. WHEN a game-type card is clicked THEN the app SHALL navigate to a listing of the user's games of that type (or to the create wizard if they have none).
4. The page SHALL be responsive: the game-type grid SHALL be 1 column on mobile, 2 on tablet, 3 on desktop.

### Requirement 7: Create-game wizard

**User Story:** As a user, I want a guided three-step wizard for creating a new game so that I can pick a type, choose songs, and configure settings without confusion.

#### Acceptance Criteria

1. The route `/games/create` SHALL render a three-step wizard with a visible progress indicator showing the current step.
2. **Step 1 — Type:** the wizard SHALL show all seven game-type cards from the registry. WHEN a card is selected THEN the wizard SHALL advance to step 2 and remember the selection.
3. **Step 2 — Songs:** the wizard SHALL show the user's song library as a checkbox list with search. WHEN the user has selected fewer songs than the chosen game type's `minSongs` THEN the "Continue" button SHALL be disabled with a message stating the minimum.
4. **Step 3 — Settings:** the wizard SHALL render a configuration form whose fields depend on the selected game type. The form's defaults SHALL come from `getDefaultSettings()`.
5. WHEN the user clicks "Create Game" on step 3 with valid input THEN the app SHALL persist the game and redirect to that game type's play route, parameterized with the new game's id.
6. WHEN the user clicks "Back" THEN the wizard SHALL return to the previous step preserving all selections.
7. WHEN the user navigates away from the wizard mid-flow THEN their unsaved selections MAY be discarded (no draft persistence required for v1).
8. The wizard SHALL also be reachable from a song's "Create Game" button on `/songs`, in which case step 2 SHALL be pre-populated with that song selected.

### Requirement 8: Game type — Memory Match (port and modernize the existing game)

**User Story:** As an existing user of the current memory game, I want my pair-matching game preserved with the same gameplay and full visual upgrade.

#### Acceptance Criteria

1. The app SHALL include a Memory Match game type whose play route is `/games/memory-match/play/[id]`.
2. WHEN the play route loads THEN the app SHALL fetch the game and its referenced songs, generate `pairCount * 2` cards from the songs' content per `MemoryMatchSettings.contentType` (`image-text`, `lyric-lyric`, or `song-verse`), shuffle them, and render the grid using the layout helper that exists today in `getGridLayout()`.
3. The gameplay rules SHALL match the existing `GamePlay.jsx`: click to flip, two flips at a time, matching pairs stay revealed, non-matching pairs flip back after 1.2s, win condition fires when all pairs are matched, with move count and elapsed timer shown throughout.
4. The "win modal" SHALL show final moves and time, with options to play again or return to the library.
5. The image upload, drag-to-reposition, and progressive-compression behavior from the existing `GameCreator.jsx` SHALL be preserved in whatever flow allows users to attach images to a Memory Match game (most likely the step-3 settings form). Images SHALL be stored on the **local filesystem** under a `public/uploads/` directory (or a sibling location served by a Next.js route handler), with the relative path/URL stored inside `settings.pairs[].url`. The data-access and storage code SHALL be wrapped in a single storage adapter so that swapping the backend to **AWS S3** later requires only changing that adapter's implementation, not call sites.
6. The visual style SHALL be updated to match the polished mockup design language (Nunito, soft shadows, rounded radii, palette tokens).

### Requirement 9: Sheet Music Learner (preserved feature)

**User Story:** As a user with PDF sheet music, I want to upload it and have lyrics extracted automatically so that I can build my song library without retyping.

#### Acceptance Criteria

1. The app SHALL include a Sheet Music Learner page at `/songs/import` that preserves the behavior of the existing `SheetMusicLearner.jsx`: drag-and-drop or browse for a PDF or image, render PDF pages to base64 PNG via `pdfjs-dist`, send the images to the Anthropic Claude API with the existing prompt, parse the JSON response into structured verses, and present them for review.
2. The Anthropic API key SHALL continue to be entered by the user and cached in `localStorage` under the existing key. This is the only `localStorage` usage in the app (Requirement 3.8).
3. The user SHALL be able to: edit the extracted song's title, edit any word, add/remove/reorder lines and verses, rename verse titles, and toggle a "remove random words" practice mode.
4. WHEN the user clicks "Save Song" with a non-empty title and at least one line of lyrics THEN the app SHALL persist the song via the songs data-access module and redirect to `/songs`.
5. The "Create from Scratch" path that exists today SHALL be preserved and simply route the user into the regular `/songs/new` editor.
6. The page SHALL be visually updated to match the new design language.
7. There SHALL be a clearly labeled disclaimer near the upload area stating that the user must own the rights to the sheet music they upload, and that lyrics are sent to a third-party AI service (Anthropic).

### Requirement 10: Game type — Jeopardy

**User Story:** As a user, I want a Jeopardy-style quiz built from my songs so that I can run a fun group activity at Sunday school.

#### Acceptance Criteria

1. The app SHALL include a Jeopardy game type with play route `/games/jeopardy/play/[id]`.
2. The configure step SHALL allow defining categories (typically one per song), and for each category, a set of questions with `points`, `clue`, `answer`, and optional `songId` linking back to a source song. There SHALL be an optional Final Jeopardy entry.
3. The play UI SHALL match the dark, classic-Jeopardy mockup in `main.jsx`: a board of category headers, point cells in a grid, with two team-score cards above the board.
4. WHEN a point cell is clicked THEN the app SHALL show the clue, allow revealing the answer, and let a host award or deduct points to either team. The cell SHALL then be marked as used.
5. The game SHALL track team scores in component state for the duration of the play session. Persisting scores across sessions is out of scope for v1.

### Requirement 11: Game type — Fill in the Blank

**User Story:** As a user, I want to play a fill-in-the-blank game on a song's lyrics so that I can practice memorization.

#### Acceptance Criteria

1. The app SHALL include a Fill in the Blank game type with play route `/games/fill-in-blank/play/[id]`.
2. Settings SHALL include `difficulty` (`easy | medium | hard`), `hintMode`, `wordsToHide` (percentage), and an optional `timerSeconds`.
3. WHEN the play route loads THEN the app SHALL render lyrics from the chosen songs with a percentage of words replaced by blank slots, and a shuffled bank of those words below.
4. WHEN the user taps a word in the bank AND a blank is selected THEN the app SHALL fill that blank, mark the bank word as used, and validate the answer.
5. The user SHALL be able to request a hint (which surfaces the first letter or similar), skip a verse, and see a running progress indicator (e.g. "2 / 5").
6. The visual style SHALL match the FillInBlankPage mockup (warm coral palette).

### Requirement 12: Game type — Verse Order

**User Story:** As a user, I want to put scrambled verses or lines back in the right order so that I can drill song structure.

#### Acceptance Criteria

1. The app SHALL include a Verse Order game type with play route `/games/verse-order/play/[id]`.
2. Settings SHALL include `granularity` (`verses | lines`) and `scrambleLevel` (`light | full`).
3. The play UI SHALL render the scrambled items as draggable cards. The user SHALL be able to drag-and-drop to reorder.
4. WHEN the user clicks "Check Order" THEN the app SHALL highlight which items are in the correct position and which are not, and SHALL allow continued editing until correct.
5. The visual style SHALL match the VerseOrderPage mockup (yellow/orange palette).

### Requirement 13: Game type — Lyric Match

**User Story:** As a user, I want to match the start of each line to its ending so that I learn the lyric flow.

#### Acceptance Criteria

1. The app SHALL include a Lyric Match game type with play route `/games/lyric-match/play/[id]`.
2. Settings SHALL include `pairCount` and `matchType` (`line-halves | question-answer | song-lyric`).
3. The play UI SHALL render two columns: line beginnings on the left, line endings on the right, both shuffled. The user SHALL select one item from each column to form a pair.
4. WHEN a correct pair is formed THEN both items SHALL be marked matched and visually disabled. WHEN an incorrect pair is formed THEN the selection SHALL clear with a brief incorrect-state animation.
5. The page SHALL show a running "Matched: X of Y pairs" indicator and complete when all pairs are matched.
6. The visual style SHALL match the LyricMatchPage mockup (green palette).

### Requirement 14: Game type — Flashcards

**User Story:** As a user, I want flip-card flashcards from a song's lyrics so that I can do quick spaced review.

#### Acceptance Criteria

1. The app SHALL include a Flashcards game type with play route `/games/flashcards/play/[id]`.
2. Settings SHALL include `flipDirection` (`lyric-to-song | song-to-lyric`), `studyMode` (`sequential | shuffle | spaced`), and `showHints`.
3. The play UI SHALL render one card at a time. WHEN the user clicks the card THEN it SHALL flip to reveal the answer.
4. After flipping, the user SHALL be able to mark the card "Know It" (advance and increment the know-it counter) or "Still Learning" (advance and increment the learning counter; in `spaced` mode, re-queue the card).
5. The page SHALL show counts for "Know It" and "Learning" and a progress indicator (e.g. "3 / 10").
6. The visual style SHALL match the FlashcardsPage mockup (purple palette).

### Requirement 15: Game type — Song Bingo

**User Story:** As a user, I want a bingo card filled with hymn-themed words so that a group can play during a service or sing-along.

#### Acceptance Criteria

1. The app SHALL include a Song Bingo game type with play route `/games/bingo/play/[id]`.
2. Settings SHALL include `cardSize` (`3 | 4 | 5`), `contentType` (`lyrics | song-titles | mixed`), and `freeSpace`.
3. The play UI SHALL render a square grid of the configured size, populated with words drawn from the chosen songs. WHEN `freeSpace` is true AND the card size is odd THEN the center cell SHALL be a free space.
4. WHEN the user taps a cell THEN it SHALL toggle marked/unmarked.
5. WHEN the marked cells form a complete row, column, or diagonal THEN the app SHALL display a "BINGO!" celebration. The win SHALL be detected automatically; the visible BINGO button is for manual confirmation only.
6. The user SHALL be able to generate a new card without leaving the page.
7. The visual style SHALL match the BingoPage mockup (pink palette).

### Requirement 16: Game library

**User Story:** As a user with multiple saved games, I want a place to find and manage them.

#### Acceptance Criteria

1. WHEN a signed-in user visits `/games` THEN the app SHALL list all of their saved games grouped or filterable by game type.
2. Each game card SHALL show: name, game type (with its icon and color), number of songs included, last-played time (if available), and actions: Play, Edit, Delete.
3. WHEN the user clicks Play THEN the app SHALL navigate to the appropriate `/games/[type]/play/[id]` route.
4. WHEN the user clicks Edit THEN the app SHALL re-enter the create wizard at step 3 with that game's settings pre-loaded.
5. WHEN the user clicks Delete THEN the app SHALL show a confirmation prompt, and on confirm, delete the row.

### Requirement 17: Visual design system

**User Story:** As a user, I want every page to feel like part of one cohesive, kid-friendly app.

#### Acceptance Criteria

1. The app SHALL use Nunito as its primary font, loaded via `next/font` for performance.
2. The app SHALL define the color palette from `index.css` as Tailwind v4 theme tokens: `primary` (#4A90D9), `background` (#FFF9F0), `foreground` (#2D3748), `muted` (#F0EDE8), `card` (#FFFFFF), `border` (#E5E1DC), and game accents `game-blue`, `game-coral`, `game-yellow`, `game-green`, `game-purple`, `game-pink`.
3. The app SHALL provide a shared `<PageLayout>` component (matching `v0-mockup/components/page-layout.tsx`) and `<Navigation>` header (matching `v0-mockup/components/navigation.tsx`) used by all authenticated routes.
4. The app SHALL provide reusable UI primitives — `Button`, `Card`, `Input`, `Label`, `Textarea` — under `components/ui/`, with prop APIs and styling matching the v0 mockup component set.
5. All pages SHALL be responsive down to a 375px viewport width without horizontal scroll.
6. The app SHALL meet WCAG AA color contrast for text and interactive elements. Note that full WCAG conformance requires manual testing with assistive technologies and is out of scope for this spec.

### Requirement 18: Repository, build, and configuration hygiene

**User Story:** As the maintainer of this project, I want the repo to stay tidy and reproducible, with no committed secrets or generated files.

#### Acceptance Criteria

1. The root `.gitignore` SHALL ignore `node_modules/`, `.next/`, `dist/`, `*.local`, `.env*` (except `.env.example`), `.DS_Store`, editor caches, and Docker volume mount paths if any are committed locally.
2. The repo SHALL include a `.env.example` documenting every required environment variable: `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL`. None of these SHALL have real values committed.
3. The repo SHALL include a `README.md` with: project description, tech stack, prerequisites (Node version, Docker), local setup steps (clone, copy `.env.example` to `.env.local`, `docker-compose up -d`, `npm install`, `npm run db:migrate`, `npm run dev`), and a brief note on the future AWS deploy direction.
4. WHEN code is pushed to the `main` branch on GitHub THEN no secret, API key, or password SHALL be present in committed files. The Anthropic API key entered at runtime SHALL only ever live in the user's browser `localStorage`.
5. The Drizzle migration files SHALL be re-runnable against a fresh PostgreSQL database to recreate the schema.
6. The repo SHALL provide npm scripts for the common dev loop: `dev`, `build`, `start`, `lint`, `db:generate` (drizzle-kit generate), `db:migrate` (drizzle-kit migrate), `db:studio` (drizzle-kit studio).

### Requirement 19: Local development environment

**User Story:** As a developer cloning this repo for the first time, I want a single, documented command sequence that gets me from clone to running app, so I never wonder if my local setup is correct.

#### Acceptance Criteria

1. The repo SHALL include a `docker-compose.yml` at the project root (or in a `docker/` directory) that defines a single `postgres` service. The service SHALL:
   - Use the official `postgres:16-alpine` image (or pin to whichever LTS Postgres version is current at implementation time).
   - Expose port `5432` on localhost.
   - Persist data to a named Docker volume so that data survives container restarts.
   - Set credentials and database name via environment variables read from `.env` (with safe non-secret defaults documented in `.env.example`).
2. WHEN a developer runs `docker-compose up -d` THEN PostgreSQL SHALL start in the background and be reachable at `postgresql://<user>:<password>@localhost:5432/<dbname>`.
3. WHEN a developer runs `npm run db:migrate` against the running container THEN all Drizzle migrations SHALL apply cleanly to a fresh database with zero errors.
4. WHEN a developer runs `npm run dev` THEN the Next.js app SHALL start on `http://localhost:3000` and successfully connect to the local database.
5. The `.env.local` file SHALL contain at minimum: a `DATABASE_URL` pointing at the local Docker Postgres, an `AUTH_SECRET` (any random 32+ char string for local dev), and an `AUTH_URL` of `http://localhost:3000`.
6. The README SHALL include a "Reset the database" snippet explaining how to drop the Docker volume and re-run migrations to start clean.
7. The chosen technologies (PostgreSQL, Drizzle, Auth.js Credentials provider) SHALL all run identically against a managed AWS RDS Postgres instance with no application-code changes — only environment variables differ. This is a forward-compatibility constraint, not a v1 deliverable.
8. The Next.js app SHALL live at the **repo root** (replacing the existing `memory-game/` directory), not inside a subdirectory. If the project later grows to include a separate backend service, restructuring into an `apps/web` + `apps/api` monorepo is a future migration explicitly accepted as a tradeoff.

### Requirement 20: File storage for uploaded images

**User Story:** As a user, when I upload a custom image for a Memory Match card, I want it stored persistently so it survives page reloads, browser cache clears, and works the same on my next dev session.

#### Acceptance Criteria

1. The app SHALL include a `lib/storage/` adapter module with a single interface for saving, retrieving, and deleting binary files. The interface SHALL be storage-backend-agnostic (e.g. `saveFile(buffer, contentType): Promise<{ url, key }>`, `deleteFile(key): Promise<void>`).
2. The v1 implementation SHALL write files to the **local filesystem** at `public/uploads/<userId>/<uuid>.<ext>`, where files become statically served by Next.js at `/uploads/<userId>/<uuid>.<ext>`.
3. WHEN a user uploads an image during Memory Match game creation THEN the upload SHALL go through a Next.js route handler (e.g. `POST /api/uploads`) that authenticates the request, applies the existing client-side compression (max 800px edge, 0.85 JPEG quality, with progressive fallback tiers from `GameCreator.jsx`), and returns the saved URL.
4. WHEN a user deletes a Memory Match game THEN the app SHALL also delete any image files referenced in that game's `settings.pairs[].url` (best-effort; orphaned files are tolerable but undesirable).
5. The `public/uploads/` directory SHALL be added to `.gitignore` (created on first upload, not committed).
6. The route handler SHALL reject uploads that are not `image/png`, `image/jpeg`, or `image/webp`, and that exceed a configurable max size (default 5 MB before compression).
7. A future swap to **AWS S3** SHALL require only adding an `S3Storage` implementation of the adapter interface and switching the import — no call-site changes.

## Open questions

All previously open questions have been resolved by the user:

- **Auth scope:** email/password only for v1. OAuth providers are out of scope.
- **Database:** PostgreSQL in Docker locally, designed to migrate to AWS RDS with no code changes.
- **Hosting:** local development only for this spec; AWS is the future direction (separate spec when ready).
- **Memory Match images:** stored on the local filesystem behind a swappable storage adapter (see Requirement 20).
- **Repo layout:** the new Next.js app replaces `memory-game/` at the repo root; no monorepo split for v1.
- **Docker:** confirmed installed and ready on the dev machine.

This spec is ready for review and, once approved, will move on to design.
