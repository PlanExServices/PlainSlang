# PlainSlang — Project Charter

## Problem and primary user
Parents and other adults cannot keep up with fast-moving teen/Gen Alpha slang, texting
shorthand, and coded emoji. Guessing is unreliable and the stakes can be real (drugs,
sextortion, bullying signals). Primary user: a parent with a school-age child.

## Accepted core outcome
A visitor opens the app, searches or browses a slang term, and reads a plain-English,
**source-cited** definition — including safety-relevant terms — with a trending list
verified against live news feeds rather than invented.

## Non-goals (explicit)
- No user accounts, login, or server-side personal data (saves/notes are localStorage-only).
- Native iOS/Android build: **out of scope for the current phase.** This is a mobile-first
  *web* product (declared platform: `web-companion` per §3.5/G-06); the brand's App Store
  title/subtitle are prepared metadata, not a store submission.
- Radar never auto-writes definitions — new-term candidates are review-only (ground-truth rule).
- No behavioral analytics or tracking.
- Deliberate domain simplification: age-group bands (elementary…college, gen-alpha/gen-z core)
  are editorial buckets from the cited parent guides, not a regulatory taxonomy.

## Platforms, stack, quality profile
- Platform: responsive web (mobile-first UI: tab bar, cards, dark mode). Declared `web-companion`.
- Stack (existing — kept per §3.0): Next.js 16.3.1, React 19.2.8, Node 20.20.2,
  PostgreSQL (Supabase-compatible) via `pg` 8.23.0, SSE realtime, plain CSS.
- Quality profile: `preview` phase.

## Connectivity, data, identity
- Online-required (DB + live feeds). Honest error states with Retry on all fetches.
- Data: public glossary content, all seeded rows cite published sources. No PII collected.
- Identity: none (deliberate).

## Declared phase
`preview`

## Acceptance criteria (testable)
1. `GET /api/health` reports 670 seeded terms on a fresh database. ✔ evidence: artifacts/evidence/smoke.log
2. All 8 primary routes return HTTP 200. ✔ smoke.log
3. Search returns cited entries (e.g. "rizz"). ✔ prior gate runs
4. Term CRUD works and broadcasts SSE events (`term-created`/`term-deleted` observed). ✔ smoke.log
5. Daily verification fetches 4 external sources and flags trending terms with headline
   evidence; failures keep prior state. ✔ evidence in prior verification runs
6. Write endpoints rate-limited (20/min/IP observed returning 429 on request #21). ✔ smoke.log
7. Domain logic unit-tested with Node test runner: 10/10 passing. ✔ evidence/unit.log

## Risks, dependencies, unresolved decisions
- Upstream HTML/RSS shape changes (Bark/Axis/Google News) degrade radar/trending to
  `blocked`-style stale state — handled, but needs periodic review.
- In-memory rate limiter is per-instance; multi-instance deployment needs a shared store.
- Supabase transaction pooler (:6543) breaks LISTEN/NOTIFY — deployment must use session
  pooler (:5432); documented in README + render.yaml.
- Open CRUD (no auth) is an accepted preview-phase risk; revisit before production-candidate.

## Cost ceiling (POL-BUDGET-029)
$0/month. Approved services: Supabase free tier, Render free tier, GitHub free.
Any paid tier requires an updated charter + explicit authorization.

## Completion label
`phase-complete` for `preview` (see artifacts/verification.json). Native-target gates are
`not-applicable` (declared web-companion platform, G-06).
