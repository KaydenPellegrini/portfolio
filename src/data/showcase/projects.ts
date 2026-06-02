/**
 * Showcase data — the single file to edit when adding real work.
 *
 * Each project renders a recruiter-friendly case study (problem -> approach ->
 * outcome) plus ONE interactive `display` mode:
 *   - embed : live, clickable iframe of a running project (framed like a browser)
 *   - build : an animated "watch it get built" simulation (code types out, UI assembles)
 *   - video : a looping screen-capture walkthrough
 *   - case  : case-study only, with a screenshot gallery (no live media)
 *
 * Placeholder assets live under `public/showcase/`. Swap the strings below for
 * real URLs / files and the page updates automatically.
 */

export type BuildStep = {
  /** A short line of code shown typing into the code panel. */
  code: string
  /** Label of the UI block that snaps into the preview panel for this step. */
  block: string
  /** Optional secondary caption under the block. */
  caption?: string
  /** Which preview region the block lands in (drives layout in BuildSimulation). */
  region?: 'header' | 'main' | 'aside' | 'footer'
}

export type ShowcaseDisplay =
  | { kind: 'embed'; url: string; title?: string }
  | { kind: 'build'; language?: string; steps: BuildStep[] }
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'case'; gallery: string[] }

export type ShowcaseProject = {
  id: string
  title: string
  /** One-line hook shown on the card. */
  summary: string
  stack: string[]
  year: string
  /** Short tag shown as the card's mode badge, e.g. "Live demo". */
  badge: string
  /** Case-study fields — shown in the detail view for every project. */
  problem: string
  approach: string
  outcome: string
  links?: { live?: string; repo?: string }
  display: ShowcaseDisplay
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'tron-portfolio',
    title: 'This Portfolio',
    summary: 'A Next.js 15 portfolio with a real-time 3D hero and an interactive build lab.',
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Three.js', 'Tailwind v4'],
    year: '2026',
    badge: 'Live demo',
    problem:
      'A plain CV tells you what someone has done, but not how they build. I wanted a portfolio that shows the craft the moment it loads.',
    approach:
      'I built it on the Next.js App Router with a hand-written WebGL hero in react-three-fiber, layered over a custom 2D grid canvas. There is a clean fallback for mobile and for anyone who prefers reduced motion, so nobody gets left out.',
    outcome:
      'A fast, fully responsive site that doubles as a working demo of the exact stack it lists, including the Lab you are reading right now.',
    links: { live: '/', repo: 'https://github.com/KaydenPellegrini' },
    display: { kind: 'embed', url: '/', title: 'kaydenpellegrini.dev' },
  },
  {
    id: 'inventory-dashboard',
    title: 'Inventory & Sales Intelligence',
    summary: 'Power BI command centre for stock movement, sales velocity, and reorder risk.',
    stack: ['Power BI', 'DAX', 'SQL', 'Power Query'],
    year: '2025',
    badge: 'Build replay',
    problem:
      'The team was finding out about stock-outs and dead stock after the fact, piecing the picture together from a handful of spreadsheets every week.',
    approach:
      'I modelled the data into a clean star schema, wrote DAX measures for sales velocity and days of cover, and laid out a single dashboard that reads from the top down, starting with headline numbers and drilling into line-item detail.',
    outcome:
      'Reorder calls that used to take half a day of spreadsheet work now happen at a glance, with risk flagged early enough to act on it instead of losing the sale.',
    display: {
      kind: 'build',
      language: 'DAX / report',
      steps: [
        { code: "KPIs := { Revenue, Units, Margin }", block: 'Headline KPI strip', region: 'header' },
        { code: "DaysOfCover = DIVIDE([Stock], [AvgDailySales])", block: 'Days-of-cover gauge', region: 'main', caption: 'flags reorder risk' },
        { code: "Velocity = SUMX(...) / DATEDIFF(...)", block: 'Sales velocity chart', region: 'main' },
        { code: "Slicer: Category / Supplier / Branch", block: 'Filter rail', region: 'aside' },
        { code: "Alert := IF([DaysOfCover] < 7, \"REORDER\")", block: 'Reorder alert table', region: 'footer', caption: 'sorted by urgency' },
      ],
    },
  },
  {
    id: 'procurement-automation',
    title: 'Procurement Workflow Automation',
    summary: 'A Power Apps + Power Automate flow that retired a manual approval chain.',
    stack: ['Power Apps', 'Power Automate', 'SharePoint', 'Dataverse'],
    year: '2025',
    badge: 'Walkthrough',
    problem:
      'Purchase requests lived in email threads and a shared sheet. Approvals stalled, versions drifted, and nobody could say for sure where a request actually was.',
    approach:
      'I built a canvas app for structured requests, backed by an automated approval flow with notifications, a full audit history, and a clear status on every item.',
    outcome:
      'Requests now move through one tracked pipeline. There are fewer copy-paste errors, approvals come back faster, and there is always a record of who approved what and when.',
    display: { kind: 'video', src: '/showcase/procurement-demo.mp4', poster: '/showcase/procurement-poster.svg' },
  },
  {
    id: 'escape-room-ops',
    title: 'Escape Room Ops Board',
    summary: 'A live booking and room-status board concept for a busy escape-room floor.',
    stack: ['React', 'TypeScript', 'Vite', 'CSS'],
    year: '2024',
    badge: 'Case study',
    problem:
      'Running several rooms at once meant juggling bookings, resets, and technical faults from memory and a paper diary during the busiest hours of the night.',
    approach:
      'I designed an at-a-glance ops board where each room is a live tile showing the current session, time remaining, reset state, and any fault that has been flagged.',
    outcome:
      'A calmer floor where staff can see the whole night at once and catch a problem before the next group walks in. It is drawn from four years of managing the real thing.',
    display: {
      kind: 'case',
      gallery: ['/showcase/ops-board-1.svg', '/showcase/ops-board-2.svg', '/showcase/ops-board-3.svg'],
    },
  },
]
