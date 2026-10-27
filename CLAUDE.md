# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Cahier de vacances" for EPMN: a French-language exercise workbook web app. Users register, work through numbered exercises, save progress, and take randomized evaluations. Admins manage exercises and users and view analytics. UI text, API error messages and seed content are in French.

Stack: Next.js 16 (App Router) + React 19, NextAuth v5 (beta, credentials/JWT), Prisma 6 on PostgreSQL, Zod 4, Tailwind 4, Resend for password-reset emails. Installable as a PWA (`public/manifest.json`, `public/sw.js` registered in `src/app/layout.tsx`).

## Commands

```bash
npm run dev            # Next dev server (localhost:3000)
npm run dev:nofork     # Custom single-process dev server (scripts/dev-no-fork.mjs); honors HOST/PORT
npm run build          # prisma generate && next build
npm run lint           # eslint (CI runs lint + test on Node 20)
npm test               # unit tests: tsx --test src/lib/*.test.ts (node:test, no DB needed)
npx tsx --test src/lib/api-progress.test.ts   # run a single test file
npm run test:e2e       # API e2e tests; skipped unless DATABASE_URL is set; spawns dev:nofork on port 3101
npm run seed           # prisma/seed.ts — WIPES evaluations, progress and exercises, then reinserts all exercises
npx prisma migrate dev # apply/create migrations (schema in prisma/schema.prisma)
```

Env vars (in `.env*`, gitignored): `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`. Optional: `EMAIL_FROM` (sender on a Resend-verified domain; required in production, the default resend.dev sender only delivers to the Resend account owner), `E2E_BASE_URL`.

Local dev note: if the repo lives on an exFAT drive, `next build` (Turbopack) fails creating junction points; this is environmental, not a code issue.

## Architecture

**Testable handler pattern.** API logic lives in `src/lib/*.ts` (e.g. `api-progress.ts`, `api-register.ts`, `admin-exercise.ts`) as pure functions that take the parsed body plus a `deps` object (Prisma calls, `revalidatePath`, etc.) and return `{ status, body }`. The route files in `src/app/api/**/route.ts` stay thin: they authenticate, parse JSON, wire real Prisma calls into `deps` and convert the result to `NextResponse`. Unit tests in `src/lib/*.test.ts` inject fake deps, so new API logic should follow this split to stay testable without a database.

**Auth and roles.** `src/lib/auth.ts` configures NextAuth with a credentials provider (bcrypt). The `jwt` callback re-reads name/email/role from the DB on every call, so role changes take effect immediately. Roles: `USER`, `ADMIN`, `OWNER`. There is no middleware: admin pages are guarded in `src/app/admin/layout.tsx`, and admin API routes call `requireAdmin()` / `requireOwner()` from `src/lib/access-control.ts`, which throw `AuthorizationError` (401/403). `src/lib/rate-limit.ts` is an in-memory per-scope limiter used on auth-related endpoints.

**Exercise data model.** `Exercise` has a unique `number` (ordering and prev/next navigation), a `type` enum (`single_choice`, `qcm`, `multi_select`, `true_false`, `free_text`, `labyrinth`), and two untyped JSON columns:
- `content`: typically `{ instruction, questions: [{ id, text, ... }], options? }`; the shape varies by type.
- `answers`: usually `Record<questionId, answer>`; for `multi_select` it is `{ correctIds: number[] }`.

User-facing queries filter on `isActive: true` (the `deletedAt` column exists in the schema but is not used in `src/`). When changing a type's JSON shape, update the seed, `ExerciseClient.tsx` (rendering and grading per type), the evaluation scoring and the admin editor together.

**Answer secrecy.** `src/app/exercises/[id]/page.tsx` only sends `answers` to the client once the user's progress is `completed` (or for `labyrinth`). `ExerciseClient.tsx` (large, type-switching component) handles per-question UI, auto-advance and "recommencer" (restart). Progress is saved through `POST /api/progress` (upsert on `userId + exerciseId`; once `completed` is true it is never reset to false).

**Evaluations.** `POST /api/evaluation` samples up to 20 random questions from active auto-gradable exercises (excluding `free_text` and `labyrinth`) and stores their `{ exerciseId, questionId }` refs. `src/app/api/evaluation/[id]/route.ts` scores the evaluation server-side against `Exercise.answers`.

**Exercise content changes** are usually made in `prisma/seed.ts` (the source of truth for exercise text/answers) or via the admin UI; `scripts/*.ts` are one-off maintenance scripts run with `npx tsx`.

`@/*` maps to `src/*`. Design notes live in `docs/plans/`.
