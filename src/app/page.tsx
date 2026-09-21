import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroVisual from '@/components/portfolio/HeroVisual'
import CodeSnippet from '@/components/portfolio/CodeSnippet'
import LiveCiStatus, { CiStatusPending } from '@/components/portfolio/LiveCiStatus'
import { contact, cvFileName, education, experience, identity, workAuthorisation } from '@/data/cv/profile'
import {
  capabilityChips,
  caseStudies,
  heroChips,
  heroSummary,
  selectedWork,
  skillsGrid,
  timelineNotes,
  whatIDo,
} from '@/data/site/home'
import styles from './page.module.css'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function Home() {
  const diploma = education[0]

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <HeroVisual />
        <div className={styles.heroContent}>
          <Image
            src="/profile.webp"
            alt="Kayden Pellegrini"
            width={260}
            height={300}
            priority
            className={styles.profileImage}
          />

          <div className={styles.heroText}>
            <h1>{identity.name}</h1>
            <p className={styles.kicker}>{identity.title}</p>
            <p className={styles.tagline}>{heroSummary}</p>

            <div className={styles.signalStrip} aria-label="Main areas of work">
              {heroChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>

            <div className={styles.heroButtons}>
              <Link href="/showcase" className={styles.btnShowcase}>
                View Work
              </Link>
              <a href={`/${cvFileName}`} download={cvFileName} className={styles.btnDownload}>
                Download CV
              </a>
              <a href={contact.github} {...external} className={styles.btnPrimary}>
                GitHub
              </a>
              <a href={contact.linkedin} {...external} className={styles.btnSecondary}>
                LinkedIn
              </a>
              <a href="#contact" className={styles.btnOutline}>
                Contact
              </a>
            </div>

            <p className={styles.workAuth}>{workAuthorisation}</p>
          </div>
        </div>
      </section>

      <section className={styles.statusBand} aria-label="Build status and source code">
        <Suspense fallback={<CiStatusPending />}>
          <LiveCiStatus />
        </Suspense>
        <p className={styles.statusLinks}>
          <span>Source:</span>
          {selectedWork.map((repo) => (
            <a key={repo.id} href={repo.repoUrl} {...external}>
              {repo.name}
            </a>
          ))}
        </p>
        <div className={styles.crypticRail} aria-hidden="true">
          {capabilityChips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-heading">
        <h2 id="about-heading">What I do</h2>
        <p className={styles.summary}>{whatIDo}</p>
      </section>

      <section className={styles.section} aria-labelledby="cases-heading">
        <h2 id="cases-heading">Case studies</h2>
        <div className={styles.caseList}>
          {caseStudies.map((study) => (
            <article key={study.id} id={study.id} className={styles.caseStudy} aria-labelledby={`${study.id}-title`}>
              <p className={styles.caseKicker}>{study.kicker}</p>
              <h3 id={`${study.id}-title`}>{study.title}</h3>
              <p className={styles.caseContext}>{study.context}</p>

              <div className={styles.caseBody}>
                <div>
                  <h4>The problem</h4>
                  {study.problem.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>
                <div>
                  <h4>What I built</h4>
                  {study.built.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>
                <div>
                  <h4>What changed</h4>
                  {study.changed.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>
              </div>

              {study.evidence && <CodeSnippet snippet={study.evidence.snippet} caption={study.evidence.caption} />}

              <div className={styles.caseLinks}>
                {study.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link key={link.href} href={link.href} className={styles.cardLink}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.href} href={link.href} {...external} className={styles.cardLink}>
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="selected-heading">
        <h2 id="selected-heading">Selected work</h2>
        <p className={styles.sectionIntro}>
          Public repositories on synthetic data, so every claim made about them can be checked against the
          code.
        </p>
        <div className={styles.repoGrid}>
          {selectedWork.map((repo) => (
            <article key={repo.id} className={styles.repoCard}>
              <p className={styles.repoName}>{repo.name}</p>
              <h3>{repo.title}</h3>
              <p>{repo.summary}</p>
              <CodeSnippet snippet={repo.snippet} caption={repo.caption} />
              <a href={repo.repoUrl} {...external} className={styles.cardLink}>
                Open the repository
              </a>
            </article>
          ))}
        </div>
        <Link href="/showcase" className={styles.sectionCta}>
          Open the Build Lab
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="skills-heading">
        <h2 id="skills-heading">Skills</h2>
        <div className={styles.skillsGrid}>
          {skillsGrid.map((group) => (
            <div key={group.label} className={styles.skillTile}>
              <h3>{group.label}</h3>
              <ul className={styles.tagList}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        <ol className={styles.timeline}>
          {experience.map((role) => (
            <li key={role.id} className={styles.timelineItem}>
              <p className={styles.timelineDates}>{role.period}</p>
              <h3>{role.role}</h3>
              <p className={styles.timelineEmployer}>
                {role.employer}, {role.location}
              </p>
              <p>{timelineNotes[role.id]}</p>
            </li>
          ))}
          <li className={`${styles.timelineItem} ${styles.timelineEducation}`}>
            <p className={styles.timelineDates}>{diploma.period}</p>
            <h3>{diploma.qualification}</h3>
            <p className={styles.timelineEmployer}>{diploma.place}</p>
            <p>{diploma.notes.join(', ')}.</p>
          </li>
        </ol>
      </section>

      <section id="contact" className={styles.section} aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <p className={styles.summary}>Email is the quickest way to reach me.</p>
        <div className={styles.contactActions}>
          <a href={`mailto:${contact.email}`} className={styles.btnDownload}>
            {contact.email}
          </a>
          <a href={`/${cvFileName}`} download={cvFileName} className={styles.btnOutline}>
            Download CV
          </a>
          <a href={contact.linkedin} {...external} className={styles.btnSecondary}>
            LinkedIn
          </a>
          <a href={contact.github} {...external} className={styles.btnPrimary}>
            GitHub
          </a>
        </div>
        <p className={styles.workAuth}>{workAuthorisation}</p>
      </section>

      <footer className={styles.footer}>
        <p>{identity.location}</p>
        <p>© {new Date().getFullYear()} Kayden Pellegrini</p>
      </footer>
    </main>
  )
}
