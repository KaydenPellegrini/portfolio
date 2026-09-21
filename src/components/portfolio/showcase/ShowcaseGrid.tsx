'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const projects = useMemo(() => groups.flatMap((group) => group.projects), [groups])

  // A link such as /showcase#rfid-stocktake opens that case study directly.
  useEffect(() => {
    const openFromHash = () => {
      const match = projects.find((project) => `#${project.id}` === window.location.hash)
      if (match) setActive(match)
    }
    const timer = window.setTimeout(openFromHash, 0)
    window.addEventListener('hashchange', openFromHash)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('hashchange', openFromHash)
    }
  }, [projects])

  const close = useCallback(() => {
    setActive(null)
    // Drop the hash so following the same link again reopens the case study.
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

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
      {active && <ProjectDetail project={active} onClose={close} />}
    </>
  )
}
