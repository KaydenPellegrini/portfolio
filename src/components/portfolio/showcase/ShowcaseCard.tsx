'use client'

import type { ShowcaseProject } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'

type Props = {
  project: ShowcaseProject
  onOpen: (project: ShowcaseProject) => void
}

export default function ShowcaseCard({ project, onOpen }: Props) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onOpen(project)}
      aria-label={`Open ${project.title}`}
    >
      <div className={styles.cardTop}>
        <span className={styles.badge}>{project.badge}</span>
        <span className={styles.year}>{project.year}</span>
      </div>
      <h2 className={styles.cardTitle}>{project.title}</h2>
      <p className={styles.cardSummary}>{project.summary}</p>
      <div className={styles.stackRow}>
        {project.stack.slice(0, 4).map((tech) => (
          <span key={tech} className={styles.stackPill}>
            {tech}
          </span>
        ))}
      </div>
      <span className={styles.cardCta}>Open the build →</span>
    </button>
  )
}
