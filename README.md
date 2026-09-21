# Kayden Pellegrini - Portfolio

Personal portfolio site for Kayden Pellegrini, data engineer and AI systems developer.

## Site Structure

- `/` - public portfolio
- `/showcase` - the Build Lab: open source, professional and personal case studies

## Content

- `src/data/cv/profile.ts` holds the facts shared by the site and the CV, plus the CV's own wording.
- `src/data/site/home.ts` holds the home page narrative, which deliberately does not repeat the CV.
- `src/data/showcase/projects.ts` holds the Build Lab case studies.

The CV at `public/Kayden-Pellegrini-CV-2026.pdf` is currently a finished PDF supplied by hand, and the CV wording in `profile.ts` is kept in step with it. The CV can also be built from `profile.ts`, which replaces the supplied file:

```bash
npm run cv
```

The generator sets the CV in Calibri, embedded from the Windows fonts folder. On a machine without Calibri, set `CV_FONT_REGULAR` and `CV_FONT_BOLD` to a metric-compatible humanist sans such as Carlito. The generator will not substitute any other face.

Demonstrations of employer systems use synthetic data only. `src/data/showcase/rfidDemo.ts` and `src/data/showcase/biDemo.ts` are entirely fabricated, and every professional case study carries a note stating what has been changed.

## Tech

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel Analytics
