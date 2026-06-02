import type { Metadata } from 'next'
import Link from 'next/link'
import { showcaseProjects } from '@/data/showcase/projects'
import ShowcaseGrid from '@/components/portfolio/showcase/ShowcaseGrid'
import styles from './showcase.module.css'

export const metadata: Metadata = {
  title: 'Build Lab | Kayden Pellegrini',
  description:
    'Interactive showcases of Kayden Pellegrini\'s work, including live demos, animated build replays, walkthroughs, and case studies across data tools and full-stack web.',
}

export default function ShowcasePage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          ← Back to portfolio
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>The Build Lab</p>
          <h1 className={styles.title}>Work, simulated</h1>
          <p className={styles.lead}>
            A hands-on look at how I build. Open any project to step inside it. Some run live, some
            replay how they were put together, and some walk through in motion. Each one comes with
            the problem it solved and the thinking behind it.
          </p>
          <div className={styles.legend} aria-hidden="true">
            <span>Live demos</span>
            <span>Build replays</span>
            <span>Walkthroughs</span>
            <span>Case studies</span>
          </div>
        </header>

        <ShowcaseGrid projects={showcaseProjects} />

        <p className={styles.note}>More builds are on the way. This lab grows as the work does.</p>
      </div>
    </main>
  )
}
