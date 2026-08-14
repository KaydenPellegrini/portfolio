import Image from 'next/image'
import Link from 'next/link'
import HeroVisual from '@/components/portfolio/HeroVisual'
import {
  contact,
  cvFileName,
  education,
  experience,
  heroSummary,
  identity,
  pillars,
  skillGroups,
  summary,
} from '@/data/cv/profile'
import { personalProjects, professionalProjects } from '@/data/showcase/projects'
import styles from './page.module.css'

const signals = ['DAX_OK', 'FLOW_ARMED', 'MODEL_SYNC', 'RFID_READ', 'QUERY_READY', 'BUILD_GREEN']

export default function Home() {
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
              {pillars.map((pillar) => (
                <span key={pillar.id}>{pillar.name}</span>
              ))}
            </div>

            <div className={styles.heroButtons}>
              <Link href="/showcase" className={styles.btnShowcase}>
                View Work
              </Link>
              <a href={`/${cvFileName}`} download={cvFileName} className={styles.btnDownload}>
                Download CV
              </a>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                GitHub
              </a>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                LinkedIn
              </a>
              <a href={`mailto:${contact.email}`} className={styles.btnOutline}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-heading">
        <div className={styles.crypticRail} aria-hidden="true">
          {signals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
        <h2 id="about-heading">What I do</h2>
        {summary.map((paragraph, index) => (
          <p key={paragraph.slice(0, 24)} className={index === 0 ? styles.summary : undefined}>
            {paragraph}
          </p>
        ))}

        <div className={styles.pillarGrid}>
          {pillars.map((pillar) => (
            <article key={pillar.id} className={styles.pillarCard}>
              <h3>{pillar.name}</h3>
              <p>{pillar.description}</p>
              <div className={styles.tagRow}>
                {pillar.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="work-heading">
        <h2 id="work-heading">Selected professional work</h2>
        <p className={styles.sectionIntro}>
          Systems, reporting and integrations built for day to day business operations. Open the Build
          Lab for the full case study on each one, including the technology, the part I owned and what
          has been changed for confidentiality.
        </p>
        <div className={styles.workGrid}>
          {professionalProjects.map((project) => (
            <article key={project.id} className={styles.projectCard}>
              <h3>{project.title}</h3>
              {project.context && <p className={styles.projectContext}>{project.context}</p>}
              <p>{project.summary}</p>
              <div className={styles.tagRow}>
                {project.stack.slice(0, 4).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className={styles.disclaimer}>
          Demonstrations of employer systems on this site are reconstructions using invented products,
          serial numbers and figures. No customer, hospital, financial or proprietary information is
          shown.
        </p>
        <Link href="/showcase" className={styles.sectionCta}>
          Open the Build Lab →
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        <div className={styles.cardStack}>
          {experience.map((item) => (
            <article key={`${item.role}-${item.period}`} className={styles.highlightCard}>
              <h3>{item.role}</h3>
              <p className={styles.period}>
                {item.company}, {item.location}
              </p>
              <p className={styles.periodDates}>{item.period}</p>
              <ul className={`${styles.bulletList} ${item.bullets.length > 6 ? styles.bulletListWide : ''}`}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="education-heading">
        <h2 id="education-heading">Education and skills</h2>
        <div className={styles.educationSkillsGrid}>
          <div className={styles.educationPanel}>
            <h3>Education</h3>
            <div className={styles.educationTimeline}>
              {education.map((item) => (
                <article key={item.qualification} className={styles.educationItem}>
                  <span>{item.period}</span>
                  <h4>{item.qualification}</h4>
                  <p className={styles.educationPlace}>{item.place}</p>
                  {item.notes.length > 0 && <p>{item.notes.join(' · ')}</p>}
                  {item.subjects && (
                    <div className={styles.tagRow}>
                      {item.subjects.map((subject) => (
                        <span key={subject}>{subject}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className={styles.skillsPanel}>
            <h3>Skills</h3>
            <div className={styles.skillGroups}>
              {skillGroups.map((group) => (
                <article key={group.name} className={styles.skillGroup}>
                  <h4>{group.name}</h4>
                  <div className={styles.tagRow}>
                    {group.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="personal-heading">
        <h2 id="personal-heading">Personal builds</h2>
        <p className={styles.sectionIntro}>
          Development work done on my own time, separate from my professional work. This is where the
          Next.js, React and TypeScript side sits, including this site.
        </p>
        <div className={styles.personalGrid}>
          {personalProjects.map((project) => (
            <article key={project.id} className={styles.projectCard}>
              <h3>{project.title}</h3>
              <p className={styles.projectContext}>{project.badge}</p>
              <p>{project.summary}</p>
              <div className={styles.tagRow}>
                {project.stack.slice(0, 4).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          {identity.location} · <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
        <p>© {new Date().getFullYear()} Kayden Pellegrini</p>
      </footer>
    </main>
  )
}
