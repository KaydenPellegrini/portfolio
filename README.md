# Kayden Pellegrini - Portfolio

Personal portfolio site for Kayden Pellegrini, focused on Power BI, Power Platform, and modern full-stack development.

## Site Structure

- `/` - public portfolio
- `/my-moon/[secret]` - private hidden page protected by `MY_MOON_TOKEN`
- `/one-month/[secret]` - private one-month anniversary page protected by `ONE_MONTH_TOKEN`

Hidden pages live under `src/app/(hidden)`. The route group keeps them out of the public app structure while preserving clean URLs.

## Tech

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel Analytics
