# PlainSlang

> **Know what your kids mean.**

A free, no-login web app that translates teen and Gen Alpha slang into plain English — plus the other dialects of the internet. Built mobile-first: dark mode, bottom tab bar, card UI, so it feels like a native app in the browser.

## Brand

| | |
| --- | --- |
| **Brand** | PlainSlang |
| **Tagline** | Know what your kids mean. |
| **App Store title** | PlainSlang: Parent Guide |
| **Subtitle** | Modern Slang in Plain English |

## Features

- **📖 Glossary** — 670+ documented slang terms with full CRUD (no accounts). Instant client-side search, tap-to-expand cards, quick save, difficulty/age filters, A–Z jump rail, and a 🎲 "surprise me" button.
- **🧭 Explore packs** — seven "jargon worlds":
  - 🧃 Teen & Gen Alpha slang (organized by age/grade group)
  - 📱 Texting shorthand
  - 🎮 Gaming slang
  - 💻 Coding jargon
  - 🏢 Corporate speak
  - ⚠️ **Red flags & safety** — coded terms that can signal risk (drugs, sextortion, hidden accounts), with parent-alert badges and a "conversation starters, not accusations" framing
  - 🙂 **Emoji codes** — what that emoji actually means in a teen's texts
- **🔗 Cross-category links** — terms live in one place but appear in every pack they relate to (e.g. *sus* shows in teen, gaming, and texting), with "Lives in:" chips to hop between packs.
- **🏠 Dashboard home** — Slang of the Day, a "Do you speak teen?" quiz with parent ranks (Certified Rizzler → NPC Energy), stat tiles, and charts.
- **🔥 Trending, verified** — we never invent what's hot (see below).
- **⚡ Real-time refresh** — every open browser updates instantly (SSE + Postgres LISTEN/NOTIFY): add/edit a term or run a verify anywhere — including straight from the Supabase dashboard — and all pages refresh live, marked by a LIVE dot.
- **🔖 Saved & notes** — bookmarks and private notes stored in `localStorage` on your browser only.

## Daily verification — one process, two checks

Once per calendar day (America/New_York), on first visit — or on demand via the "🛡️ Verify now" button — the server runs a single unified process (`GET /api/verify`):

1. **News check:** reads Google News RSS (teen/Gen Alpha slang + Word-of-the-Year coverage) and Merriam-Webster's Word of the Day feed, then flags glossary terms that actually appear in headlines (word-boundary matching; ambiguous everyday words excluded). Official Words of the Year stay flagged even on quiet days. Each trending term shows its headline evidence.
2. **Slang radar:** re-scans Bark's and Axis's parent slang guides and diffs every bolded term against the library. New terms surface as *review candidates* — definitions are never auto-written.

Both halves fail independently; a failed source keeps its previous results. The Trending page shows verification times, per-source status, headlines used, and Wiktionary spot-checks.

## Sourcing policy

Every seeded term cites a published source: Bark's 2026 parent guides, Axis's 2026 slang guide, Merriam-Webster Slang, Dictionary.com/Oxford Word of the Year coverage, Wiktionary (titles verified via the MediaWiki API), and Wikipedia. No invented meanings — terms without a verifiable source are omitted.

## Stack

Next.js 16 (App Router) · React 19 · **PostgreSQL (Supabase)** via `pg` · Drizzle ORM schema · Server-Sent Events realtime · plain CSS design tokens (no CSS framework)

## Getting started

```bash
npm install
npm run build
npm start        # binds 0.0.0.0:3000
```

Dev mode: `npm run dev`

Set `DATABASE_URL` to a PostgreSQL connection string before starting — a free [Supabase](https://supabase.com) project works out of the box (use the **Session pooler** string on port 5432, *not* the transaction pooler on 6543, so LISTEN/NOTIFY realtime works). The schema is created and all 670 terms are seeded automatically on the first request (`GET /api/health` triggers it).

```bash
export DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

## Deploying

Two supported targets — same codebase, the data layer picks its mode from env vars:

### Cloudflare Workers (recommended — no cold-start sleep, free tier)

The app runs at the edge via [OpenNext](https://opennext.js.org/cloudflare); data + realtime come from Supabase over HTTP/WebSockets (no TCP sockets needed).

1. **Supabase:** create a free project → SQL Editor → run `scripts/supabase-schema.sql` (tables, read-only RLS for the public key, Realtime publication).
2. **Seed:** `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:supabase` (one-time; idempotent).
3. **Configure:** put your project URL + anon key in `wrangler.jsonc` `vars` (they're public-safe; RLS restricts them to reads). Store the private key as a secret: `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`.
4. **Deploy:** `npx wrangler login && npm run deploy`. Your app is live at `https://plainslang.<your-subdomain>.workers.dev` — always warm, no sleep.

In this mode browsers get realtime straight from **Supabase Realtime** (WebSockets); the SSE endpoint is unused.

### Node host (Render / Docker / VPS)

Set `DATABASE_URL` to any Postgres (Supabase session pooler on port 5432 works) and the app uses the `pg` driver with LISTEN/NOTIFY → SSE realtime. `render.yaml` and `Dockerfile` are included. GitHub Pages cannot run it (static hosting).

- **Render (recommended):** the included `render.yaml` is a one-click blueprint — Dashboard → New → Blueprint → connect this repo. On a paid plan the persistent disk keeps your database (and user-added terms) across deploys; on the free plan the app reseeds its full library on each deploy.
- **Docker (any host — Railway, Fly.io, a VPS):** `docker build -t plainslang . && docker run -p 3000:3000 -v plainslang-data:/data plainslang`
- **Vercel:** not supported as-is (serverless filesystem is ephemeral, so SQLite won't persist) — migrate to a hosted DB first.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/terms?q=&ageGroup=&trending=1&category=` | Search / filter terms (category matches home pack + cross-links) |
| POST | `/api/terms` | Create a term (validated) |
| GET | `/api/terms/:id` | Read one term |
| PUT | `/api/terms/:id` | Update a term |
| DELETE | `/api/terms/:id` | Delete a term |
| GET | `/api/verify` | Unified daily verification (`?force=1` to run on demand) |
| GET | `/api/trending` | News-feed trending check only |
| GET | `/api/radar` | Bark/Axis slang radar only |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/quiz` | Random quiz question (real definitions as decoys) |
| GET | `/api/health` | Seed + counts |
| GET | `/api/stream` | **Server-Sent Events** — live updates (term CRUD, verify, radar, direct DB edits) |

## Project layout

```
app/                  # Next.js App Router pages + API routes
  page.js             # Dashboard (home)
  glossary/           # Teen slang browser
  explore/            # Pack hub + /explore/[pack]
  term/[id]/          # Term detail + edit
  trending/           # Trending + unified verification panel
  saved/              # localStorage bookmarks & notes
  add/                # Create form
  api/                # terms CRUD, verify, trending, radar, stats, quiz, health
components/           # TabBar, TermBrowser, TermCard, TermForm, AppHeader
lib/
  db.js               # SQLite init, migrations, idempotent seeding (v1–v6)
  schema.js           # Drizzle ORM schema
  seed-terms.json     # 130 original teen terms (parsed from cited glossary)
  packs*.js           # Pack seed data (all cited) + cross-link table
  trending.js         # News-feed verification
  radar.js            # Bark/Axis guide scanner
  validate.js         # Server-side input validation
  constants.js        # Age groups & difficulties
  local.js            # localStorage helpers (saved terms, notes)
```

## Notes

- Seeding is idempotent: each expansion wave is guarded by a meta flag and a dedupe check, so restarts and fresh clones never double-insert. When a seed term already exists in another pack, it gets cross-linked instead of duplicated.
- The original spec listed PostgreSQL; this build uses SQLite for zero-config setup. The Drizzle schema in `lib/schema.js` maps 1:1 if you want to migrate.
- Formerly "GenADecoder" — legacy `GENA_DB_PATH` env var and old localStorage keys are still honored/migrated automatically.
