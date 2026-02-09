# Input validation and utf8 fixes design

## Goals
- Fix UTF-8 corruption in UI and seed content so French text renders correctly.
- Add API input validation for register, progress, and evaluation routes.
- Reduce write pressure by debouncing exercise autosave.
- Make seed data deterministic and avoid stale evaluations after reseed.

## Non-goals
- No UI redesign.
- No database schema changes.
- No new product features beyond robustness and correctness.

## Context
The app is a Next.js App Router project using Prisma and NextAuth. Data flows are:
- Register -> /api/register -> User
- Progress autosave -> /api/progress -> UserProgress
- Evaluation start -> /api/evaluation -> Evaluation
- Evaluation submit -> /api/evaluation/[id] -> score + completedAt

## Approach options
Option A (recommended): targeted fixes in existing routes and components.
- Add zod schemas per route for request validation and basic normalization.
- Debounce autosave in ExerciseClient to cut write frequency.
- Update seed script to clear Evaluation and UserProgress, and normalize strings.
- Fix UTF-8 corruption by saving affected files as UTF-8 and replacing broken sequences.
Pros: fast, low risk, minimal refactor. Cons: validation stays local to routes.

Option B: centralize validation and handlers.
- Create shared validators in src/server/validators and reuse across routes.
- Slightly restructure API route code to use helpers.
Pros: cleaner reuse. Cons: more files and refactor.

Option C: validation only.
- Add zod validation without other changes.
Pros: quick. Cons: does not address data quality or performance issues.

Recommendation: Option A for minimum change and maximum impact.

## Architecture and data flow changes
- Add zod to validate request bodies in:
  - src/app/api/register/route.ts
  - src/app/api/progress/route.ts
  - src/app/api/evaluation/[id]/route.ts
- Normalize email to lower-case on register.
- Debounce saveAnswers in ExerciseClient. Save on blur for free_text; immediate save for non-text.
- Update seed to delete Evaluation before Exercise to avoid dangling refs.
- Replace corrupted characters in UI/seed content; keep existing copy.

## Error handling
- For invalid payloads, return 400 with a short error message.
- For missing evaluation or unauthorized access, keep current 401/404 behavior.
- For failed autosave, show a small inline message and allow retry on next change.

## Testing
- Add minimal tests for validation (optional if no test setup). If no test runner exists, skip.
- Manual smoke:
  - Register with invalid email and short password.
  - Start evaluation and submit.
  - Open exercise, type free text, verify save does not spam network.

## Rollout and risk
- Low risk: changes are localized to API routes, one client component, and seed.
- UTF-8 fixes are content-only and should be validated by quick UI checks.
