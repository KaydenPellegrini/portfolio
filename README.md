# Kayden Pellegrini - Portfolio

Personal portfolio site for Kayden Pellegrini, focused on Power BI, Power Platform, and modern full-stack development.

## Site Structure

- `/` - public portfolio
- `/my-moon/[secret]` - private hidden page protected by `MY_MOON_TOKEN`

Hidden pages live under `src/app/(hidden)`. The route group keeps them out of the public app structure while preserving clean URLs.

## Tech

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel Analytics

## Local Setup

```bash
npm install
npm run dev
```

For the hidden page, set:

```env
MY_MOON_TOKEN=
NEXT_PUBLIC_KAYDEN_LAT=
NEXT_PUBLIC_KAYDEN_LNG=
NEXT_PUBLIC_MY_MOON_PLACE_LAT=
NEXT_PUBLIC_MY_MOON_PLACE_LNG=
NEXT_PUBLIC_MY_MOON_PLACE_NAME=
```
