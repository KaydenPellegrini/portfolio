'use client'

import { useState } from 'react'
import type { ShowcaseProject } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'
import ShowcaseCard from './ShowcaseCard'
import ProjectDetail from './ProjectDetail'

export type ShowcaseGroup = {
  id: string
  title: string
  intro: string
  projects: ShowcaseProject[]
}

type Props = {
  groups: ShowcaseGroup[]
}

export default function ShowcaseGrid({ groups }: Props) {
  const [active, setActive] = useState<ShowcaseProject | null>(null)

  return (
    <>
      {groups.map((group) => (
        <section key={group.id} className={styles.group} aria-labelledby={`${group.id}-heading`}>
          <h2 className={styles.groupTitle} id={`${group.id}-heading`}>
            {group.title}
          </h2>
          <p className={styles.groupIntro}>{group.intro}</p>
          <div className={styles.grid}>
            {group.projects.map((project) => (
              <ShowcaseCard key={project.id} project={project} onOpen={setActive} />
            ))}
          </div>
        </section>
      ))}
      {active && <ProjectDetail project={active} onClose={() => setActive(null)} />}
    </>
  )
}
