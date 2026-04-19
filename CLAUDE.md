# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server on **port 5000**
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, ESLint 9)
- `npm run db:seed` — seed database with sample data

No test runner is configured.

## Architecture

**Stack:** Next.js 16 App Router · TypeScript (strict) · Prisma 7 + Neon (serverless PostgreSQL) · NextAuth v5 · Tailwind CSS v4 · shadcn/ui · Recharts

### Route Groups
- `app/(auth)/` — public routes (login, register)
- `app/(protected)/` — authenticated routes (home, history, leaderboard, dashboard, profile, admin); protected via `auth()` middleware
- `app/api/auth/[...nextauth]/` — NextAuth route handler

### Data Flow
All mutations go through **Next.js Server Actions** in `lib/actions/` (weight.ts, auth.ts, profile.ts, admin.ts). After mutations, call `revalidatePath()` to bust the cache. Pages are server components; interactive pieces are split into `*Client.tsx` client components.

### Database
Three Prisma models: **Group** → **User** (role: USER|ADMIN, groupId FK) → **WeightEntry** (weight Decimal 5,2, recordedAt). Prisma client singleton is in `lib/db.ts`. Uses `@prisma/adapter-neon` for serverless compatibility.

### Auth
NextAuth v5 Credentials provider with bcryptjs hashing. JWT sessions enriched with `id`, `role`, `groupId` via session/jwt callbacks in `lib/auth.ts`.

### Validation
Zod v4 schemas in `lib/validations.ts`. All error messages are in **Thai**.

### Thai/Buddhist Era Specifics
`lib/calculations.ts` contains weight calculation logic and Thai date utilities (Buddhist Era = CE + 543). Month names and UI labels are in Thai throughout the app.
