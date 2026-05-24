# HymnPlay

Learn songs through games. Build a personal library of hymns and turn them into seven different game types — Memory Match, Jeopardy, Fill in the Blank, Verse Order, Lyric Match, Flashcards, and Song Bingo. Optional sheet music import via Anthropic Claude extracts lyrics from PDFs and images.

## Tech stack

- **Next.js 16** (App Router) with TypeScript and Tailwind CSS v4
- **PostgreSQL 16** running locally via Docker Compose
- **Drizzle ORM** + **drizzle-kit** for schema and migrations
- **Auth.js v5** (NextAuth) with the Credentials provider and the Drizzle adapter
- **lucide-react** icons
- **@dnd-kit** for drag-and-drop reordering

## Prerequisites

- Node.js 20 or newer
- Docker Desktop (for the local Postgres container)

## Local setup

```bash
# 1. Clone and install
git clone https://github.com/tannerk2/bensons_games.git
cd bensons_games
npm install

# 2. Configure environment
cp .env.example .env.local
# Generate a real AUTH_SECRET and paste it into .env.local:
openssl rand -base64 32

# 3. Start Postgres
docker compose up -d

# 4. Apply migrations
npm run db:migrate

# 5. (Optional) Seed sample data
npm run db:seed
# Creates user test@hymnplay.local / test1234 with two sample songs.

# 6. Run the dev server
npm run dev
# Open http://localhost:3000
```

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` | Production build (also runs `tsc --noEmit`) |
| `npm run start` | Run the production server |
| `npm run db:generate` | Regenerate the SQL migration when `db/schema.ts` changes |
| `npm run db:migrate` | Apply pending migrations to the connected database |
| `npm run db:push` | Push the Drizzle schema directly (skips migrations; useful in dev) |
| `npm run db:studio` | Open Drizzle Studio in your browser |
| `npm run db:seed` | Seed a local test user and sample songs |

## Sheet Music Learner (optional)

The `/songs/import` page can extract lyrics from a PDF or image using Anthropic's Claude API. It requires an API key, which is stored only in your browser's local storage. Get a key at [console.anthropic.com](https://console.anthropic.com/account/keys). Pages are uploaded directly to Anthropic from your browser; the server never sees them or your key.

## Reset the database

To wipe everything and start fresh:

```bash
docker compose down -v   # removes the persistent volume
docker compose up -d     # fresh container
npm run db:migrate       # recreate the schema
npm run db:seed          # optional sample data
```

## Project layout

```
app/                     # Next.js App Router routes
components/              # React components, organized by feature
  ui/                    # Reusable primitives (Button, Card, Input, etc.)
  auth/                  # Sign-in / sign-up forms
  songs/                 # Song library, editor, sheet music importer
  games/
    create/              # Wizard + per-type configure components
    play/                # One play screen per game type
  home/                  # Landing-page sections
db/                      # Drizzle schema, migrations, seed
lib/
  auth.ts                # Auth.js config
  data/                  # Database access layer (one file per table)
  storage/               # File storage adapter (filesystem now, swappable)
  validation/            # Zod schemas
  game-types.ts          # Game type registry
  types.ts               # Domain types
public/uploads/          # User-uploaded card images (gitignored)
proxy.ts                 # Next.js proxy for auth-aware redirects
docker-compose.yml       # Local Postgres
drizzle.config.ts        # drizzle-kit config
```

## Future direction

The stack is designed to migrate to AWS without code changes:

- The local Postgres container becomes an **RDS** instance — only `DATABASE_URL` changes.
- The local filesystem `storage` adapter (`lib/storage/local.ts`) gets a sibling `s3.ts` and one import in `lib/storage/index.ts` switches over.
- The Next.js app deploys to **Amplify Hosting**, **App Runner**, or **ECS Fargate**.
- Auth.js Credentials provider keeps working as-is; adding Google or other OAuth providers is a config-only change.

This isn't built yet; it's the path the spec at `.kiro/specs/hymnplay/` is designed for.
