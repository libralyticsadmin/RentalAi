# RentalAi

AI-first property management system for short-term rental operators.  
**Phase 0** — monorepo scaffold, multi-tenant org stubs, authenticated empty dashboard.

## Stack

| Layer | Choice |
|-------|--------|
| Monorepo | pnpm workspaces (`apps/web`, `packages/shared`) |
| Web | Next.js 15 App Router, TypeScript, Tailwind CSS v4 |
| API | Next.js route handlers (`/api/*`) |
| Auth | **Mock session by default** (`AUTH_MODE=mock`); Clerk keys optional later |
| DB | SQLite via Prisma (schema is Postgres-ready) |

## Quick start

```bash
# from repo root
cp .env.example apps/web/.env
pnpm install
pnpm db:push
pnpm db:seed   # optional — demo tenant also auto-created on mock login
pnpm dev
```

Open **http://localhost:3000**

- Landing → **Enter demo dashboard** (or visit `/dashboard`; mock auth redirects and signs you in)
- Health check: **http://localhost:3000/api/health**

### Auth notes

- Default `AUTH_MODE=mock` needs **no secrets**. It creates a Demo PMC org + `operator@rentalai.local` owner and sets an httpOnly session cookie.
- To prepare for Clerk later, set `AUTH_MODE=clerk` and provide `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`. If keys are missing, the app falls back to mock.

## Workspace scripts

| Script | What it does |
|--------|----------------|
| `pnpm dev` | Start Next.js on port 3000 |
| `pnpm build` | Prisma generate + production build |
| `pnpm typecheck` | TypeScript check for web |
| `pnpm db:push` | Apply Prisma schema to local SQLite |
| `pnpm db:seed` | Seed demo org / user / membership |

## Layout

```
apps/web          Next.js app (UI + API + Prisma)
packages/shared   Shared types (roles, nav stubs)
docs/             PRD and task notes
.github/workflows CI smoke (install, db push, typecheck, build)
```

## Phase 0 exit criteria

- [x] `pnpm dev` serves a real app shell
- [x] Multi-tenant org + membership + role stubs
- [x] Authenticated empty dashboard (mock auth when secrets missing)
- [x] `.env.example` + CI smoke workflow

Phase 1 adds properties, calendar, and reservations.
