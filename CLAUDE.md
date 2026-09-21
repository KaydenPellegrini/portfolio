# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: start the Next.js dev server
- `npm run build`: production build (run before finishing significant work)
- `npm run lint`: ESLint via `eslint-config-next` (run before finishing significant work)
- `npm start`: run the production build
- `npm run cv`: rebuild `public/Kayden-Pellegrini-CV-2026.pdf` from `src/data/cv/profile.ts`. The served CV is currently supplied by hand, and this replaces it (see below)

No test runner is configured. `next.config.ts` pins `turbopack.root` to this directory because unrelated lockfiles sit in parent folders; without it Turbopack infers the wrong workspace root and dependency resolution fails in dev.

## This repository is public

`github.com/KaydenPellegrini/portfolio` is public, so everything committed here is published, including history. Nothing private belongs in it: no personal photos or audio, no private pages, no tokens, no machine paths. The private pages that used to live here were removed on 2026-09-21. Do not reintroduce secret-token routes; anything private needs a separate private repository.

## Architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind v4. Path alias `@/*` maps to `src/*`.

### Routes

- `src/app/page.tsx`: public portfolio landing.
- `src/app/showcase/page.tsx`: the Build Lab, grouping open source, professional and personal case studies. `/showcase#<project-id>` opens a case study directly.
- `src/app/supremediesel/page.tsx`: a separate client site served from the same deployment. Leave its copy alone unless asked.
- `src/app/opengraph-image.tsx`: the share card, rendered at build time with `next/og`.

Components live in `src/components/portfolio/*` and `src/components/supremediesel/*`, with copy and content in `src/data/<feature>/` so text can be edited without touching layout.

### Public portfolio content

The site and the CV share facts but deliberately not wording. A reader who already has the CV should still learn something from the site.

- `src/data/cv/profile.ts`: facts shared by both (identity, contact, roles and dates, education, languages, work authorisation) and the CV's own wording (profile, key skills, experience bullets with bold lead phrases, selected work). It must not import anything, because the CV generator transpiles it on its own.
- `src/data/site/home.ts`: the home page narrative (what I do, case studies written as problem, build and outcome prose, repo cards, skills grid, timeline lines).
- `src/data/site/snippets.ts`: code excerpts copied verbatim from the public repositories and pinned to a commit. Never edit the code by hand; copy new lines and update the commit together.
- `src/data/showcase/projects.ts`: Build Lab case studies. Each answers the same six questions (`CaseStudy`) and picks one `display` mode rendered by `src/components/portfolio/showcase/`.

`scripts/generate-cv.mjs` builds the PDF with `scripts/pdf-writer.mjs`. The brief fixes the typeface as Calibri or a similar humanist sans, so the generator embeds a subset of Calibri from the Windows fonts folder and refuses to build rather than substitute anything else. On another machine, set `CV_FONT_REGULAR` and `CV_FONT_BOLD` to a metric-compatible humanist sans such as Carlito. Font files are never copied into the repo. The CV must stay ATS readable: single column, real text with a ToUnicode map, no tables, no images, contact details in the body. The CV currently served is a finished PDF supplied by hand (set in Carlito), not the generator's output. Keep the CV wording in `profile.ts` in step with it, and do not run `npm run cv` unless the supplied PDF is meant to be replaced by a generated one.

### Live build status

`src/lib/githubCiStatus.ts` reads the latest completed `dbt build` run on `main` of `KaydenPellegrini/serial-margin-dbt` from the GitHub Actions API, without a token, cached for 15 minutes. Only `success` is shown as passing; anything unconfirmed is shown as unknown, never as green. Do not add hardcoded status or test-count chips next to it.

### Confidentiality rule for the public site

Public-facing facts can be stated; the employer's backend internals cannot. Nothing proprietary to the employer goes into this repo, the site, commit messages, or the public repos: no real table or column names, product codes, serials, supplier, customer, hospital or doctor names, prices, costs, margins, volumes, screenshots, endpoints, tenant identifiers or environment names. Describe the class of problem, the method and the relative outcome. Anything that needs data to demonstrate uses synthetic data and says so. `src/data/showcase/rfidDemo.ts` and `src/data/showcase/biDemo.ts` are entirely fabricated and use deliberately generic labels.

### Styling

Tailwind v4 via `@tailwindcss/postcss`. `src/app/globals.css` holds only the Tailwind import and base variables; page styling lives in CSS modules next to each route. Public pages hold still under `prefers-reduced-motion`, and the hero canvas pauses when it is off screen.

### Content Security Policy

`src/proxy.ts` sets a nonce-based `script-src ... 'strict-dynamic'` on every request, and `src/app/layout.tsx` reads that nonce from the `x-nonce` request header. Next picks the nonce up from the CSP request header and stamps it onto its own inline bootstrap scripts, so removing the `headers()` call in the root layout makes the pages static again, drops the nonce, and silently breaks hydration on every page. Keep them together.

## Conventions specific to this repo

- Public copy and commit messages: no em dashes, en dashes or arrow symbols. British and South African spelling. Write the employer as `Virtumed`. No invented metrics or marketing filler, and no responsibilities, projects or numbers that are not already in `src/data/cv/profile.ts`.
