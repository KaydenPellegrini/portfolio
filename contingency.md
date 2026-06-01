# Contingency Notes

## One-Month Page

The private anniversary page lives at:

```text
/one-month/[secret]
```

It is protected by:

```env
ONE_MONTH_TOKEN=__REDACTED_ROTATE_IN_VERCEL__
```

Locally, the page URL is:

```text
http://localhost:3000/one-month/one-month
```

If the token is missing or the secret does not match, the route returns `404`.

## Images

Memory images must be placed in:

```text
public/one-month/
```

Use sequential filenames:

```text
1.jpg
2.jpg
3.jpg
...
10.jpg
```

The image count is controlled by:

```env
ONE_MONTH_IMAGE_COUNT=10
```

If more images are added, update `ONE_MONTH_IMAGE_COUNT`. The page generates memory entries from `1.jpg` through that number.

If an image is missing, the UI falls back to:

```text
public/one-month/placeholder.svg
```

## Known Build Warning

`next build` passes, but Next warns about multiple `package-lock.json` files:

```text
C:\Users\KaydenPellegrini\Downloads\package-lock.json
C:\Users\KaydenPellegrini\Downloads\Code\portfolio\package-lock.json
```

This does not currently block linting or building. To silence it, configure `outputFileTracingRoot` in `next.config.ts` or remove the unrelated parent lockfile if it is not needed.

## Verification Commands

Use:

```bash
npm run lint
npm run build
npm run dev
```

Expected checks:

```text
/one-month/one-month -> 200
/one-month/wrong-secret -> 404
```

The dev-server background launch has been unreliable inside the sandbox. Running `npm run dev` manually in a terminal is the safest way to preview.

## Content Source

Main editable content is in:

```text
src/data/oneMonth/story.ts
```

Current confirmed details:

- Her name is Kelly.
- Relationship start time is `2026-05-02T17:04:36+02:00`.
- One-month milestone is `2026-06-02T17:04:36+02:00`.
- Favourite colour: turquoise.
- Interests/details: sushi, Lunch Bar chocolate, Red Bull, plants, flowers, nature, fashion design, creativity, outgoing personality, The Vampire Diaries, Marvel, Spider-Man, Lego.

## Important Components

```text
src/app/(hidden)/one-month/[secret]/page.tsx
src/components/one-month/OneMonthHeroStage.tsx
src/components/one-month/GardenReveal.tsx
src/components/one-month/MemoryGallery.tsx
src/components/one-month/ColourByNumber.tsx
src/components/one-month/OneMonthAtmosphere.tsx
src/components/one-month/TimeTogether.tsx
src/data/oneMonth/story.ts
```

## Fallback Plan

If something breaks close to delivery:

1. Keep the route/token protection intact.
2. Keep the About Her text from `story.ts`.
3. Keep `MemoryGallery` working with `public/one-month/1.jpg` through `10.jpg`.
4. Temporarily remove only the heaviest interactive section if needed, likely `ColourByNumber`.
5. Run `npm run build` before deploying.
