# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build (run before finishing significant work)
- `npm run lint` — ESLint via `eslint-config-next` (run before finishing significant work)
- `npm start` — run the production build
- `npm run cv` — regenerate `public/Kayden-Pellegrini-CV-2026.pdf` from `src/data/cv/profile.ts`

No test runner is configured. `next.config.ts` pins `turbopack.root` to this directory because unrelated lockfiles sit in parent folders; without it Turbopack infers the wrong workspace root and dependency resolution fails in dev.

## Architecture

Next.js 15 App Router + React 19 + TypeScript + Tailwind v4. Path alias `@/*` → `src/*`.

### Route layout

- `src/app/page.tsx` — public portfolio landing.
- `src/app/showcase/page.tsx` — the Build Lab, grouping professional case studies and personal builds.
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

### Public portfolio content

`src/data/cv/profile.ts` is the single source of truth for identity, contact details, summary, the four professional pillars, experience, education and skill groups. Both `src/app/page.tsx` and the CV generator read from it, so the site and the PDF cannot drift. `src/data/showcase/projects.ts` holds the case studies; each answers the same six questions (`CaseStudy`) and picks one `display` mode rendered by `src/components/portfolio/showcase/`.

`scripts/generate-cv.mjs` builds the PDF with `scripts/pdf-writer.mjs`, a small base-14 Helvetica writer, so the text stays selectable and ATS readable with no extra dependency. It transpiles the two data modules with the `typescript` devDependency, which works only because neither file has imports of its own. Run `npm run cv` after editing either file.

### Confidentiality rule for the public site

Demonstrations of employer systems must use synthetic data and sanitised architecture only. `src/data/showcase/rfidDemo.ts` and `src/data/showcase/biDemo.ts` are entirely fabricated, and every professional project carries a `case.sanitised` note that is rendered in the modal. Never add real customer, hospital, financial, credential, endpoint or tenant data.

### Styling

Tailwind v4 via `@tailwindcss/postcss`. Global animation keyframes/utilities used by the hidden pages (e.g. `one-month-twinkle`, `one-month-ribbon`, `one-month-vine`, `one-month-title`) live in `src/app/globals.css`. When adding bespoke animations for a feature, prefer adding them to `globals.css` next to the existing `one-month-*` classes rather than scattering `<style>` tags.

### Content Security Policy

`src/proxy.ts` sets a nonce-based `script-src ... 'strict-dynamic'` on every request, and `src/app/layout.tsx` reads that nonce from the `x-nonce` request header. Next picks the nonce up from the CSP request header and stamps it onto its own inline bootstrap scripts, so removing the `headers()` call in the root layout makes the pages static again, drops the nonce, and silently breaks hydration on every public page. Keep them together.

## Conventions specific to this repo

- Hidden pages must keep `metadata.robots = { index: false, follow: false }`.
- Public copy avoids em dashes, invented metrics and marketing filler. Do not add responsibilities, projects, employers or numbers that are not already in `src/data/cv/profile.ts`.
- `params` is a `Promise` in App Router here — `await params` before reading the secret (matches Next 15 typing).
- `/one-month` is intentionally distinct from `/my-moon` in tone and visuals (turquoise-led, mobile-first, garden/colour/photo interactions). Don't port `/my-moon` patterns (moon/orbit language, fact cards) onto it. See `agent.md` for the fuller design brief and the confirmed date `REDACTED` → `REDACTED` (do not revert the `17:04:36` time).
- `.env.local` drives image counts and tokens; keep new content data-driven the same way.
