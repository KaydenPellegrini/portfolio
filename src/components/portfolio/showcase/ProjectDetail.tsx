'use client'

import { useEffect, useRef } from 'react'
/* eslint-disable @next/next/no-img-element -- gallery uses local SVG placeholders */
import type { ShowcaseProject } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'
import LiveEmbed from './LiveEmbed'
import BuildSimulation from './BuildSimulation'
import VideoLoop from './VideoLoop'
import ArchitectureFlow from './ArchitectureFlow'
import RfidStocktake from './RfidStocktake'
import BiDashboard from './BiDashboard'

type Props = {
  project: ShowcaseProject
  onClose: () => void
}

/** The six questions, in the order they are answered in the modal. */
const CASE_BLOCKS = [
  { key: 'problem', heading: 'The problem' },
  { key: 'built', heading: 'What I built' },
  { key: 'technology', heading: 'Technology' },
  { key: 'ownership', heading: 'What I owned' },
  { key: 'outcome', heading: 'Outcome' },
] as const

function DisplayMedia({ project }: { project: ShowcaseProject }) {
  const { display } = project
  switch (display.kind) {
    case 'embed':
      return <LiveEmbed url={display.url} title={display.title} />
    case 'build':
      return <BuildSimulation steps={display.steps} language={display.language} />
    case 'video':
      return <VideoLoop src={display.src} poster={display.poster} />
    case 'flow':
      return <ArchitectureFlow stages={display.stages} payload={display.payload} />
    case 'rfid':
      return <RfidStocktake />
    case 'bi':
      return <BiDashboard />
    case 'none':
      return null
    case 'case':
      return (
        <div className={styles.gallery}>
          {display.gallery.map((src) => (
            <img key={src} src={src} alt={`${project.title} screen`} loading="lazy" />
          ))}
        </div>
      )
  }
}

export default function ProjectDetail({ project, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = `showcase-${project.id}-title`

  useEffect(() => {
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Minimal focus trap within the modal.
      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, iframe, input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal} ref={modalRef}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close project detail"
          ref={closeRef}
        >
          ×
        </button>

        <div className={styles.modalTop}>
          <span className={styles.modalBadge}>{project.badge}</span>
          {project.context && <span className={styles.modalContext}>{project.context}</span>}
        </div>

        <h2 className={styles.modalTitle} id={titleId}>
          {project.title}
        </h2>

        <div className={styles.modalStack}>
          {project.stack.map((tech) => (
            <span key={tech} className={styles.stackPill}>
              {tech}
            </span>
          ))}
        </div>

        {project.display.kind !== 'none' && (
          <div className={styles.mediaPane}>
            <DisplayMedia project={project} />
          </div>
        )}

        <div className={styles.caseStudy}>
          {CASE_BLOCKS.map((block) => (
            <div key={block.key} className={styles.caseBlock}>
              <h3>{block.heading}</h3>
              <p>{project.case[block.key]}</p>
            </div>
          ))}
        </div>

        <div className={styles.sanitisedNote}>
          {/* Public repos have nothing withheld, so the heading names what the section
              actually covers there: the data and the limits. */}
          <h3>{project.category === 'open-source' ? 'Data and limits' : 'Sanitised for confidentiality'}</h3>
          <p>{project.case.sanitised}</p>
        </div>

        {(project.links?.live || project.links?.repo) && (
          <div className={styles.linkRow}>
            {project.links.live && (
              <a
                className={`${styles.modalLink} ${styles.modalLinkPrimary}`}
                href={project.links.live}
                target={/^https?:\/\//.test(project.links.live) ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                Visit live ↗
              </a>
            )}
            {project.links.repo && (
              <a
                className={`${styles.modalLink} ${styles.modalLinkSecondary}`}
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                View code ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
