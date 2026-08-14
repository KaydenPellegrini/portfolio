# Kayden Pellegrini - Portfolio

Personal portfolio site for Kayden Pellegrini, business systems developer, data analyst and Power Platform specialist.

## Site Structure

- `/` - public portfolio
- `/showcase` - the Build Lab: professional case studies and personal builds
- `/my-moon/[secret]` - private hidden page protected by `MY_MOON_TOKEN`
- `/one-month/[secret]` - private one-month REDACTED page protected by `ONE_MONTH_TOKEN`

Hidden pages live under `src/app/(hidden)`. The route group keeps them out of the public app structure while preserving clean URLs.

## Content

Professional content has one source of truth in `src/data/cv/profile.ts`, and case studies live in `src/data/showcase/projects.ts`. Both the site and the downloadable CV read from those files.

Regenerate `public/Kayden-Pellegrini-CV-2026.pdf` after editing either one:

```bash
npm run cv
```

Demonstrations of employer systems use synthetic data only. `src/data/showcase/rfidDemo.ts` and `src/data/showcase/biDemo.ts` are entirely fabricated, and every professional case study carries a `sanitised` note stating what has been changed.

## Tech

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel Analytics
