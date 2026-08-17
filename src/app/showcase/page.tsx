import type { Metadata } from 'next'
import Link from 'next/link'
import { openSourceProjects, personalProjects, professionalProjects } from '@/data/showcase/projects'
import ShowcaseGrid, { type ShowcaseGroup } from '@/components/portfolio/showcase/ShowcaseGrid'
import styles from './showcase.module.css'

export const metadata: Metadata = {
  title: 'Work | Kayden Pellegrini',
  description:
    'Data engineering and AI case studies, including a dbt margin pipeline and two self-verifying audit skills, alongside RFID stocktaking, Power BI reporting, systems integration and cross site broadcast.',
}

const groups: ShowcaseGroup[] = [
  {
    id: 'open-source',
    title: 'Open source',
    intro:
      'Public repositories you can read and run. Both are built on synthetic data, so nothing has been withheld and every claim on this page can be checked against the code.',
    projects: openSourceProjects,
  },
  {
    id: 'professional-work',
    title: 'Professional work',
    intro:
      'Systems, reporting and integrations built in a working business. Each case study covers the problem, what I built, the technology, the part I owned, the outcome, and what has been changed or invented for this page. The demonstrations are reconstructions using synthetic data, not the employer systems themselves.',
    projects: professionalProjects,
  },
  {
    id: 'personal-builds',
    title: 'Personal builds',
    intro:
      'Development work done on my own time. This is where the Next.js, React and TypeScript side lives, including this site. None of it was commercial work.',
    projects: personalProjects,
  },
]

export default function ShowcasePage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          ← Back to portfolio
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Build Lab</p>
          <h1 className={styles.title}>Selected work</h1>
          <p className={styles.lead}>
            Data engineering and AI work with the code in the open, alongside the business systems,
            reporting and automation built for real operations. Open any card for the full case
            study. Every panel can be read without touching it.
          </p>
          <p className={styles.disclaimer}>
            All demonstrations of employer systems are reconstructions built for this site using
            invented products, serial numbers and figures. No customer, hospital, financial or
            proprietary information appears anywhere.
          </p>
        </header>

        <ShowcaseGrid groups={groups} />
      </div>
    </main>
  )
}
