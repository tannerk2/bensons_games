# Implementation Plan

## Overview

This plan turns the design into incremental, individually verifiable tasks. The work runs across 8 phases (0–7); each phase ends with a runnable app and a clear "Definition of done" inherited from the design doc. Tasks within a phase generally run sequentially; some phases (notably Phase 6 game-type implementations) contain tasks that can be parallelized.

Conventions:
- Check the box `[ ]` → `[x]` when a task is complete.
- Each task lists the requirements it satisfies. Numbers reference `requirements.md` in this folder.
- Tasks are scoped to be reviewable in a single session, typically a single PR.

## Tasks

### Phase 0: Workspace cleanup and Next.js skeleton

- [ ] 1. Archive the v0 mockup and clean stray root artifacts
  - Move `v0-mockup/` to `docs/v0-mockup/` (preserves it as reference, excluded from build)
  - Delete the root `.DS_Store`
  - Delete the empty root `package-lock.json` (the real one will be in the new app)
  - Move `.vscode/settings.json` content (if useful) into the project root once Next.js is set up; otherwise leave the file alone
  - _Requirements: 1.7, 1.8_

- [ ] 2. Scaffold a Next.js 15 + TypeScript + Tailwind v4 app at the repo root
  - Run `npm create next-app@latest .` choosing: TypeScript yes, App Router yes, Tailwind yes, src/ no, import alias `@/*`
  - Verify `package.json` has `next@^15`, `react@^19`, `typescript`, and `tailwindcss@^4`
  - Confirm `npm run dev` starts on `http://localhost:3000` and `npm run build` succeeds
  - Commit the scaffold so subsequent diffs are reviewable
  - _Requirements: 1.1, 1.4, 1.5_

- [ ] 3. Configure design tokens and base layout
  - Replace the generated `app/globals.css` with the `@theme` tokens from the design doc (Nunito font, full color palette, radii, soft shadow)
  - Add Nunito via `next/font/google` in `app/layout.tsx`
  - Set the body to use the font, background, and foreground tokens
  - Verify the app loads and renders with Nunito on a cream background
  - _Requirements: 1.2, 17.1, 17.2_

- [ ] 4. Set up the root `.gitignore`, `.env.example`, and project-level config
  - Update root `.gitignore` to ignore `node_modules`, `.next`, `dist`, `*.local`, `.env*` (except `.env.example`), `.DS_Store`, and `public/uploads/*` (keeping a `.gitkeep`)
  - Create `.env.example` with placeholders for `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`
  - Add `tsconfig.json` `paths` alias `@/*` (Next.js scaffold typically does this; verify)
  - _Requirements: 18.1, 18.2_

### Phase 1: Local database and auth foundation

- [ ] 5. Add Docker Compose for local Postgres
  - Create `docker-compose.yml` at the repo root with one service: `postgres:16-alpine`
  - Configure named volume for data persistence, port `5432:5432`, env vars from `.env`
  - Document the exact connection string in `.env.example` (`postgresql://hymnplay:hymnplay@localhost:5432/hymnplay`)
  - Verify `docker compose up -d` starts the container and the DB is reachable
  - _Requirements: 19.1, 19.2_

- [ ] 6. Install Drizzle and define the database schema
  - Install `drizzle-orm`, `postgres`, `drizzle-kit` (dev)
  - Create `db/schema.ts` with all tables from the design: `users`, `accounts`, `sessions`, `verificationTokens`, `songs`, `games`
  - Include the `passwordHash` column on `users` and the `lastPlayedAt` column on `games`
  - Create `db/index.ts` (or `lib/data/db.ts`) that constructs the Drizzle client from `DATABASE_URL`
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 7. Configure drizzle-kit and generate the initial migration
  - Create `drizzle.config.ts` pointing at `db/schema.ts` and `db/migrations/`
  - Add npm scripts: `db:generate` (drizzle-kit generate), `db:migrate` (drizzle-kit migrate), `db:studio` (drizzle-kit studio), `db:push` (alias for migrate that runs on a fresh DB)
  - Run `npm run db:generate` to produce the initial migration SQL
  - Hand-author `db/migrations/<next>_triggers.sql` containing the `set_updated_at` function and the two triggers on `songs` and `games`
  - Verify `npm run db:migrate` applies cleanly to the running container
  - _Requirements: 3.8, 3.12, 18.6, 19.3_

- [ ] 8. Add Auth.js v5 with Credentials provider and Drizzle adapter
  - Install `next-auth@beta` (v5), `@auth/drizzle-adapter`, `bcrypt`, `@types/bcrypt`, `zod`
  - Create `lib/auth.ts` with the NextAuth config from the design (DrizzleAdapter, JWT sessions, Credentials provider with bcrypt comparison, JWT/session callbacks copying `userId`)
  - Create `lib/data/users.ts` with `getUserByEmail`, `getUserById`, `createUser`
  - Create `app/api/auth/[...nextauth]/route.ts` re-exporting `handlers.GET` and `handlers.POST`
  - Generate a strong `AUTH_SECRET` and document the generation command in the README
  - _Requirements: 2.1, 2.2, 2.10, 3.4_

- [ ] 9. Build sign-up and sign-in pages
  - Create `lib/validation/auth.ts` with Zod schemas for sign-in and sign-up
  - Create `lib/auth-actions.ts` with `signUpAction(formData)` that validates, checks for existing email, bcrypt-hashes, inserts the user, and calls `signIn("credentials", ...)`
  - Create `app/sign-up/page.tsx` with a styled form using the Tailwind tokens, calling the action
  - Create `app/sign-in/page.tsx` with a form that calls `signIn("credentials", { email, password, redirectTo: "/" })`
  - Surface validation errors inline; surface "Email already in use" inline
  - _Requirements: 2.3, 2.10_

- [ ] 10. Add middleware for auth-aware route protection
  - Create `middleware.ts` per the design (auth wrapper, public route allow-list, redirect rules)
  - Configure the matcher to skip `_next/static`, `_next/image`, `favicon.ico`, and `/uploads/*`
  - Verify: signed-out user visiting `/songs` redirects to `/sign-in`; signed-in user visiting `/sign-in` redirects to `/`
  - _Requirements: 2.4, 2.5, 2.7_

- [ ] 11. Add a sign-out action and a placeholder authed home
  - Add `signOutAction` (server action wrapping `signOut`)
  - Create a minimal `app/page.tsx` that calls `auth()`, shows a "Hello {email}" + sign-out button when signed in, and a "Sign in" link when signed out
  - Verify the full sign-up → home → sign-out → sign-in loop end-to-end
  - _Requirements: 2.6, 2.8_

### Phase 2: Design system and shared shell

- [ ] 12. Port UI primitives from the v0 mockup to `components/ui/`
  - Port `Button` (variants: primary, secondary, ghost, danger; sizes: sm, md, lg; supports `asChild`)
  - Port `Card`, `CardHeader`, `CardContent`, `CardFooter`
  - Port `Input`, `Textarea`, `Label`
  - Add `Badge` and `ProgressSteps` (referenced in the design but not in v0)
  - Add `lib/utils.ts` with `cn()` using `clsx` + `tailwind-merge`
  - Each primitive uses Tailwind classes only; no inline styles
  - _Requirements: 17.4_

- [ ] 13. Build the auth-aware Navigation header
  - Create `components/navigation.tsx` as a server component that calls `auth()`
  - Signed-out: brand + "Sign in" / "Sign up" links
  - Signed-in: brand + nav links to `/songs` and `/games` + user menu (email + sign-out form)
  - Match the polished mockup's sticky-header style (white bg, primary border-bottom, soft shadow)
  - _Requirements: 2.8, 17.3_

- [ ] 14. Build the PageLayout wrapper and use it on existing routes
  - Create `components/page-layout.tsx` matching the v0 component's max-width and padding behavior
  - Apply to `app/sign-in/page.tsx` and `app/sign-up/page.tsx` for consistent presentation
  - Wire `<Navigation>` into `app/layout.tsx`
  - _Requirements: 17.3, 17.5_

- [ ] 15. Replace the placeholder home with the polished mockup home
  - Build `components/home/HeroSection.tsx`, `GameTypeGrid.tsx`, `StatsBanner.tsx` matching the polished `v0-mockup/app/page.tsx`
  - Hardcode stats to zero (real counts come in Phase 3)
  - Render the game-type grid from `GAME_TYPE_LIST` (registry built in next task) — until then, scaffold with a placeholder array, then refactor in task 16
  - Verify mobile, tablet, desktop layouts (1, 2, 3 columns)
  - _Requirements: 6.1, 6.4, 17.5_

- [ ] 16. Implement the game type registry
  - Create `lib/types.ts` with `Song`, `SongVerse`, `GameType` (slug union), and the discriminated union of per-type settings
  - Normalize the type slug `fill-blank` → `fill-in-blank` to match URL slugs
  - Create `lib/game-types.ts` with `GAME_TYPES` record per the design (icon = lucide component, color = palette key, minSongs, defaultSettings factory)
  - Refactor `GameTypeGrid` to render from `GAME_TYPE_LIST`
  - _Requirements: 5.1, 5.2, 5.3_

### Phase 3: Songs feature end-to-end

- [ ] 17. Build the songs data-access module
  - Create `lib/data/songs.ts` with: `listSongs(userId)`, `getSong(userId, id)`, `getSongsByIds(userId, ids)`, `createSong(userId, input)`, `updateSong(userId, id, input)`, `deleteSong(userId, id)`, `countSongs(userId)`
  - Every function takes `userId` and includes it in WHERE/INSERT
  - Return types use `Song` from `lib/types.ts`
  - _Requirements: 3.7, 3.9_

- [ ] 18. Add Zod validation for songs
  - Create `lib/validation/song.ts` with `songInputSchema` requiring non-empty title and at least one verse with at least one non-empty line
  - Export a parser used by all create/update server actions
  - _Requirements: 4.6_

- [ ] 19. Build server actions for songs
  - Create `app/songs/actions.ts` with `createSongAction`, `updateSongAction`, `deleteSongAction`
  - Each action calls `auth()`, throws on unauthenticated, validates input, calls the data layer, then `revalidatePath('/songs')` and either returns `{ ok: true }` or `redirect('/songs')`
  - Delete action also calls `findGamesReferencingSong` (added in task 32) and surfaces the warning data; for now, just delete unconditionally and add the warning logic in Phase 7
  - _Requirements: 4.7_

- [ ] 20. Build the song library page
  - Create `app/songs/page.tsx` (RSC) that calls `auth()` and `listSongs(userId)`
  - Create `components/songs/SongList.tsx` (client) with a search input that filters by title
  - Empty state with "Add manually" → `/songs/new` and "Upload sheet music" → `/songs/import`
  - Each song row shows title, verse count, last-updated relative time, "Edit" and "Create Game" buttons
  - _Requirements: 4.1, 4.2_

- [ ] 21. Build the song editor (create + edit)
  - Create `components/songs/SongEditorForm.tsx` (client component, accepts optional initial song)
  - Title input with validation message
  - `VerseEditor` sub-component: list of verses, each with a title input and a list of lines, with add/remove/reorder buttons
  - Use `@dnd-kit/sortable` for verse reordering (install dep here)
  - Submit calls the appropriate server action; surfaces validation errors
  - Wire `app/songs/new/page.tsx` and `app/songs/[id]/edit/page.tsx`
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 22. Wire real song count into the home stats banner
  - Update `app/page.tsx` to fetch `countSongs(userId)` and pass to `StatsBanner`
  - Hardcode games-related stats to 0 for now (filled in Phase 5)
  - _Requirements: 6.2_

### Phase 4: Sheet Music Learner port

- [ ] 23. Port the Sheet Music Learner to a Next.js page
  - Install `pdfjs-dist` (kept from old app)
  - Create `app/songs/import/page.tsx` as a client component (the file must be `"use client"` to use file APIs and Anthropic fetch)
  - Port the existing `SheetMusicLearner.jsx` logic verbatim, retyped to TypeScript: API key handling via `localStorage`, PDF page → base64 PNG conversion, Anthropic Claude API call with the existing prompt, JSON parsing, edit-mode drag/drop verses
  - Replace the inline-style CSS with Tailwind classes per the new design system; keep the page's purple/cream visual treatment
  - "Save Song" calls `createSongAction` and redirects to `/songs`
  - "Create from Scratch" navigates to `/songs/new`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 24. Add the licensing/privacy disclaimer
  - Display a clear disclaimer near the upload zone stating: user must own the rights, lyrics are sent to Anthropic, API key is stored only in this browser's localStorage
  - _Requirements: 9.7_

### Phase 5: Memory Match (storage adapter + first game type)

- [ ] 25. Build the storage adapter interface and local implementation
  - Create `lib/storage/types.ts` with the `StorageAdapter` interface
  - Create `lib/storage/local.ts` with the filesystem implementation (writes to `public/uploads/<userId>/<uuid>.<ext>`, returns key + URL, validates the path stays inside the uploads root)
  - Create `lib/storage/index.ts` exporting `storage = localStorage`
  - Add `public/uploads/.gitkeep` and ensure `public/uploads/*` is in `.gitignore` (the .gitkeep is already covered by negation if needed)
  - _Requirements: 20.1, 20.2, 20.5, 20.7_

- [ ] 26. Build the upload route handler
  - Create `app/api/uploads/route.ts` with a POST handler that authenticates via `auth()`, validates content type and size, calls `storage.saveFile`, and returns `{ url, key }`
  - Reject with 401 (unauth), 400 (bad input), 500 (unexpected) per the error model
  - _Requirements: 20.3, 20.6_

- [ ] 27. Build the games data-access module
  - Create `lib/data/games.ts` with: `listGames`, `listRecentGames`, `getGame`, `createGame`, `updateGame`, `deleteGame`, `recordGamePlayed`, `countGames`, `findGamesReferencingSong`
  - All filter by `userId`; `recordGamePlayed` updates `last_played_at = now()`
  - _Requirements: 3.7, 3.9, 6.2_

- [ ] 28. Add Zod validation for games and per-type settings
  - Create `lib/validation/game.ts`
  - Define a `gameSettingsByType` record with one Zod schema per `GameType` matching the discriminated union in `lib/types.ts`
  - Export `parseGameSettings(type, raw)` that picks the right schema
  - Define `gameInputSchema` for create/update
  - On create/update, also verify all `song_ids` correspond to user-owned rows (Property 6)
  - _Requirements: 3.6, 7.4_

- [ ] 29. Build server actions for games
  - Create `app/games/actions.ts` with `createGameAction`, `updateGameAction`, `deleteGameAction`, `recordGamePlayedAction`
  - Same auth + validate + call-data-layer + revalidate pattern as song actions
  - Delete also removes any image files referenced in `settings.pairs[].url` via `storage.deleteFile`
  - _Requirements: 16.5, 20.4_

- [ ] 30. Build the game library page
  - Create `app/games/page.tsx` (RSC) calling `listGames(userId)`
  - Show each game's name, type icon + color, song count, last-played time, with Play / Edit / Delete buttons
  - Filterable or grouped by game type
  - Empty state encouraging "Create a Game"
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 31. Build the create-game wizard skeleton (Memory Match path only)
  - Create `app/games/create/page.tsx` (RSC) that fetches user's songs and existing game-type counts
  - Create `components/games/create/CreateGameWizard.tsx` (client) with a reducer for `{ step, type, songIds, settings, name }`
  - Implement Step 1 (game type cards from the registry) and Step 2 (song checkbox list with search and minSongs gating)
  - Implement Step 3 ONLY for Memory Match in this task; other types render "Coming soon"
  - Submit calls `createGameAction` and redirects to `/games/<type>/play/<id>`
  - Support pre-population from `?songId=` query param when arriving from a song's "Create Game" button
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.8_

- [ ] 32. Build the Memory Match configure component
  - Create `components/games/create/ConfigureMemoryMatch.tsx` (client)
  - Pair-count selector, content-type selector, theme color, name input
  - Image uploader: ports the file-input + drag-and-drop from `GameCreator.jsx`, calls `/api/uploads`, stores returned URL in settings
  - Drag-to-reposition on uploaded images using the existing pointer-event logic, ported to TS
  - Client-side compression tier loop preserved verbatim before upload (max 800px, 0.85 JPEG, with smaller fallback tiers if upload returns 413/quota)
  - Text-content pair option
  - _Requirements: 8.5_

- [ ] 33. Build the Memory Match play page
  - Create `app/games/memory-match/play/[id]/page.tsx` (RSC) that fetches game + referenced songs, fires `recordGamePlayedAction(id)` once
  - Create `components/games/play/memory-match/PlayMemoryMatch.tsx` (client)
  - Port gameplay rules from `GamePlay.jsx`: shuffle pairs, click to flip, two-flips-then-evaluate, matched stays revealed, 1.2s flip-back, win modal with moves + time
  - Visual style updated to the new design language; preserve the per-game theme color
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

- [ ] 34. Wire real game stats and Continue Playing on home
  - Update `app/page.tsx` to fetch `countGames(userId)` for stats
  - Add `<ContinuePlaying>` rendering the user's three most recent games via `listRecentGames(userId, 3)`
  - "Games played" stat = count of games where `last_played_at IS NOT NULL`
  - _Requirements: 6.1, 6.2_

- [ ] 35. Delete the legacy Vite `memory-game/` directory
  - At this point Memory Match has parity with the old app plus auth, persistence, and the new design
  - Remove `memory-game/` and any stray references
  - Confirm `npm run build` still succeeds
  - _Requirements: 1.6_

### Phase 6: Remaining six game types

Each task in this phase follows the same pattern: settings Zod schema → `Configure<Type>` component slot in the wizard → `Play<Type>` client component → play route page. Order is easiest first.

- [ ] 36. Implement Flashcards
  - Settings UI: flipDirection, studyMode, showHints
  - Play UI: single-card flip, "Know It" / "Still Learning" buttons, counters, progress
  - Visual: purple palette, matches `FlashcardsPage` mockup
  - Route: `/games/flashcards/play/[id]`
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 37. Implement Lyric Match
  - Settings UI: pairCount, matchType
  - Play UI: two-column matching, click-pair-to-match, correct/incorrect feedback, progress
  - Visual: green palette, matches `LyricMatchPage` mockup
  - Route: `/games/lyric-match/play/[id]`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 38. Implement Verse Order
  - Settings UI: granularity (verses | lines), scrambleLevel (light | full)
  - Play UI: drag-and-drop reorder using `@dnd-kit/sortable`, "Check Order" highlights correct/incorrect positions
  - Visual: yellow/orange palette, matches `VerseOrderPage` mockup
  - Route: `/games/verse-order/play/[id]`
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 39. Implement Fill in the Blank
  - Settings UI: difficulty, hintMode, wordsToHide, optional timerSeconds
  - Lyric tokenization helper (pure function) to pick which words become blanks per difficulty
  - Play UI: lyrics with blank slots, shuffled word bank below, tap-to-fill, hint button, skip, progress
  - Visual: coral palette, matches `FillInBlankPage` mockup
  - Route: `/games/fill-in-blank/play/[id]`
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 40. Implement Song Bingo
  - Settings UI: cardSize, contentType, freeSpace
  - Card-generation helper: pick words from songs, shuffle, place free space at center if applicable
  - Play UI: square grid, tap to mark, automatic win detection on row/column/diagonal, "BINGO!" celebration, "New Card" button
  - Visual: pink palette, matches `BingoPage` mockup
  - Route: `/games/bingo/play/[id]`
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 41. Implement Jeopardy
  - Settings UI: full editor for categories with point/clue/answer rows, optional Final Jeopardy
  - This is the richest configure component; consider a dedicated route/section if it doesn't fit the wizard step 3
  - Play UI: dark classic-Jeopardy board, two team-score cards, click cell → modal with clue/answer/award-or-deduct buttons, mark cell used
  - Team scores live in component state for the session only
  - Route: `/games/jeopardy/play/[id]`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

### Phase 7: Polish and finalization

- [ ] 42. Add the delete-song warning when games reference it
  - Update `deleteSongAction` to first call `findGamesReferencingSong(userId, songId)`
  - If any games reference the song, return `{ ok: false, references: [...gameNames] }` instead of deleting
  - The song-list UI surfaces the warning in a confirm dialog listing affected games and lets the user proceed (which then re-calls the action with a `force: true` flag)
  - Affected games are NOT cascade-deleted; they remain and the play screen handles the missing song (Property 6 + Error Handling)
  - _Requirements: 4.8_

- [ ] 43. Wire the edit-game flow
  - From the game library, "Edit" navigates to `/games/create?gameId=<id>` (or a dedicated route)
  - The wizard pre-loads the game's type, songs, settings, and name, and starts at step 3
  - On submit, calls `updateGameAction` instead of create
  - _Requirements: 16.4_

- [ ] 44. Add a `db:seed` script for local dev convenience
  - Create `db/seed.ts` that, given a known dev user (created via the script if not present), inserts two example songs ("Amazing Grace" and "Holy, Holy, Holy") with the standard verses
  - Add `db:seed` npm script
  - _Requirements: 18.6_

- [ ] 45. Final responsiveness pass
  - Test every page at 375px viewport with no horizontal scroll
  - Verify the game-type grid breaks 1 / 2 / 3 columns at the right breakpoints
  - Verify game play screens are usable on mobile (especially Bingo and Jeopardy grid sizes)
  - _Requirements: 6.4, 17.5_

- [ ] 46. Final color-contrast pass
  - Verify text and interactive elements meet WCAG AA contrast against their backgrounds
  - The cream-background palette is generally fine; double-check muted-text-on-cream and white-on-yellow combinations
  - _Requirements: 17.6_

- [ ] 47. Write the README
  - Project description and tech stack
  - Prerequisites (Node 20+, Docker Desktop)
  - Local setup steps: clone → `cp .env.example .env.local` → `docker compose up -d` → `npm install` → `npm run db:migrate` → optional `npm run db:seed` → `npm run dev`
  - "Reset the database" section: `docker compose down -v && docker compose up -d && npm run db:migrate`
  - Brief AWS-future note: same code runs against RDS Postgres + an AWS-hosted Next.js (Amplify / App Runner / ECS) by changing env vars only
  - _Requirements: 18.3, 19.6_

- [ ] 48. Final forward-compatibility check
  - Stop and remove the local Postgres container and its volume
  - Bring up a fresh container, run `npm run db:migrate` from zero, verify everything works end-to-end (sign up new user, create song, create memory match game, play, win)
  - This validates the migration path that will be used against AWS RDS later
  - _Requirements: 19.7_

## Task Dependency Graph

The strict-order spine is: **Phase 0 → 1 → 2 → 3 → 4 → 5**, then Phase 6 fans out, then Phase 7 closes.

```
Phase 0 (skeleton)
  1 → 2 → 3 → 4
        │
        ▼
Phase 1 (DB + auth)
  5 → 6 → 7 → 8 → 9 → 10 → 11
                              │
                              ▼
Phase 2 (design system + home)
  12 → 13 → 14 → 15 → 16
                       │
                       ▼
Phase 3 (songs)
  17 → 18 → 19 → 20 → 21 → 22
                            │
                            ▼
Phase 4 (sheet music)            ┐
  23 → 24                        │  Phases 4 and 5 both depend on
                                 │  Phase 3 (Song persistence),
Phase 5 (memory match)           │  and may proceed in parallel,
  25 → 26 → 27 → 28 → 29 → 30    │  but Phase 5 is the harder path
                ↓                │  so we sequence it after Phase 4
              31 → 32 → 33 → 34  │
                          │      │
                          ▼      ▼
                          35 (delete legacy memory-game/)
                                   │
                                   ▼
Phase 6 (remaining game types — independent of each other)
   ┌────────────┬────────────┬────────────┐
   │            │            │            │
   36 (Flash)  37 (Match)  38 (Order)  39 (Fill)
   40 (Bingo) 41 (Jeopardy)
                                   │
                                   ▼
Phase 7 (polish)
  42 → 43 → 44 → 45 → 46 → 47 → 48
```

### Hard prerequisites

- Tasks 5–7 (Docker, Drizzle schema, migrations) MUST complete before any data work.
- Task 8 (Auth.js wiring) MUST complete before tasks 9–11 (sign-in/up pages, middleware, signed-in home).
- Task 16 (game type registry) MUST complete before tasks 31, 36–41 (anything referencing `GAME_TYPES`).
- Task 17 (songs data layer) MUST complete before tasks 19–22 (song actions and pages) and tasks 27–34 (game data + Memory Match end-to-end).
- Task 25 (storage adapter) MUST complete before task 26 (upload route) and task 32 (Memory Match configure with image upload).
- Task 35 (delete legacy `memory-game/`) MUST NOT run before task 33 (Memory Match play page) is verified working — it is the parity gate.
- Tasks 36–41 (game types) all depend on tasks 27–31 (game data layer + wizard skeleton). Among themselves they are independent.

### Soft prerequisites

- Task 22 (real song count on home) is best deferred until after task 17 lands; visually irrelevant during scaffolding.
- Task 34 (Continue Playing + real game count) is best deferred until at least one game type is playable end-to-end.
- Phase 7 polish tasks may be reordered freely; they are not interdependent.

### Wave definitions

The dependency graph above expressed as parallelizable waves. Tasks within the same wave can run in parallel; later waves require earlier waves to complete.

```json
{
  "waves": [
    { "id": "wave-0", "tasks": [1, 2, 3, 4], "description": "Workspace cleanup and Next.js skeleton" },
    { "id": "wave-1", "tasks": [5, 6, 7], "description": "Docker Postgres + Drizzle schema + migrations" },
    { "id": "wave-2", "tasks": [8], "description": "Auth.js wiring with Drizzle adapter" },
    { "id": "wave-3", "tasks": [9, 10], "description": "Sign-in/up pages and route-protection middleware" },
    { "id": "wave-4", "tasks": [11], "description": "Sign-out and authed placeholder home" },
    { "id": "wave-5", "tasks": [12, 13, 14], "description": "Design-system primitives, Navigation, PageLayout" },
    { "id": "wave-6", "tasks": [16], "description": "Game type registry (must precede home grid refactor)" },
    { "id": "wave-7", "tasks": [15], "description": "Polished home page rendered from registry" },
    { "id": "wave-8", "tasks": [17, 18], "description": "Songs data layer + validation" },
    { "id": "wave-9", "tasks": [19, 20, 21], "description": "Song actions, library page, editor" },
    { "id": "wave-10", "tasks": [22], "description": "Wire real song count into home stats" },
    { "id": "wave-11", "tasks": [23, 24], "description": "Sheet Music Learner port (depends on song actions from wave-9)" },
    { "id": "wave-12", "tasks": [25, 26], "description": "Storage adapter and upload route handler" },
    { "id": "wave-13", "tasks": [27, 28, 29], "description": "Games data layer, validation, server actions" },
    { "id": "wave-14", "tasks": [30, 31], "description": "Game library page and create-wizard skeleton" },
    { "id": "wave-15", "tasks": [32, 33], "description": "Memory Match configure component and play page" },
    { "id": "wave-16", "tasks": [34, 35], "description": "Real home stats with Continue Playing; delete legacy memory-game/" },
    { "id": "wave-17", "tasks": [36, 37, 38, 39, 40, 41], "description": "Six remaining game types — independent of each other, fully parallelizable" },
    { "id": "wave-18", "tasks": [42, 43, 44], "description": "Polish: delete-song warning, edit-game flow, dev seed" },
    { "id": "wave-19", "tasks": [45, 46, 47, 48], "description": "Final passes: responsiveness, contrast, README, fresh-DB validation" }
  ]
}
```


## Notes

- Each task should result in code that compiles and the app that builds. If a task can't be completed without breaking the build, split it.
- The `v0-mockup/` directory under `docs/` is reference-only and may be deleted at the end of Phase 7 once the app no longer needs it.
- All requirement numbers reference `requirements.md` in this same spec folder.
