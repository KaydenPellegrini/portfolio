# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build (run before finishing significant work)
- `npm run lint` — ESLint via `eslint-config-next` (run before finishing significant work)
- `npm start` — run the production build

No test runner is configured. Next emits a "multiple lockfiles / inferred workspace root" warning that pre-dates current work and does not block the build.

## Architecture

Next.js 15 App Router + React 19 + TypeScript + Tailwind v4. Path alias `@/*` → `src/*`.

### Route layout

- `src/app/page.tsx` — public portfolio landing.
- `src/app/(hidden)/` — route group for private pages. The `(hidden)` group keeps these out of the public structure while preserving clean URLs. Its `layout.tsx` sets `robots: { index: false, follow: false }` for everything inside.
- `src/app/(hidden)/my-moon/[secret]/page.tsx` — gated by `process.env.MY_MOON_TOKEN`. If the env var is missing or `secret` doesn't match, the page calls `notFound()`.
- `src/app/(hidden)/one-month/[secret]/page.tsx` — gated by `process.env.ONE_MONTH_TOKEN`. Also reads `ONE_MONTH_IMAGE_COUNT` (clamped 1–40, default 10) to drive `createOneMonthMemories(...)`, which expects sequential images at `public/one-month/1.jpg … N.jpg`.

The token-gating pattern (env var presence check + strict equality on the dynamic `[secret]` segment, then `notFound()`) is the contract for any new hidden page — follow it rather than inventing alternative auth.

### Feature folders

Each hidden page has a parallel component folder and (optionally) a data folder:

- `src/components/my-moon/*` paired with `src/data/myMoon/*`
- `src/components/one-month/*` paired with `src/data/oneMonth/*`
- `src/components/portfolio/*` for the public site

Page files compose many small client components; copy/content lives in `src/data/<feature>/` (e.g. `oneMonthStory`, `createOneMonthMemories`) so text can be edited without touching layout.

### Styling

Tailwind v4 via `@tailwindcss/postcss`. Global animation keyframes/utilities used by the hidden pages (e.g. `one-month-twinkle`, `one-month-ribbon`, `one-month-vine`, `one-month-title`) live in `src/app/globals.css`. When adding bespoke animations for a feature, prefer adding them to `globals.css` next to the existing `one-month-*` classes rather than scattering `<style>` tags.

## Conventions specific to this repo

- Hidden pages must keep `metadata.robots = { index: false, follow: false }`.
- `params` is a `Promise` in App Router here — `await params` before reading the secret (matches Next 15 typing).
- `/one-month` is intentionally distinct from `/my-moon` in tone and visuals (turquoise-led, mobile-first, garden/colour/photo interactions). Don't port `/my-moon` patterns (moon/orbit language, fact cards) onto it. See `agent.md` for the fuller design brief and the confirmed date `2026-05-02T17:04:36+02:00` → `2026-06-02T17:04:36+02:00` (do not revert the `17:04:36` time).
- `.env.local` drives image counts and tokens; keep new content data-driven the same way.
