'use client'

import { useState } from 'react'
import type { ShowcaseProject } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'
import ShowcaseCard from './ShowcaseCard'
import ProjectDetail from './ProjectDetail'

type Props = {
  projects: ShowcaseProject[]
}

export default function ShowcaseGrid({ projects }: Props) {
  const [active, setActive] = useState<ShowcaseProject | null>(null)

  return (
    <>
      <div className={styles.grid}>
        {projects.map((project) => (
          <ShowcaseCard key={project.id} project={project} onOpen={setActive} />
        ))}
      </div>
      {active && <ProjectDetail project={active} onClose={() => setActive(null)} />}
    </>
  )
}
