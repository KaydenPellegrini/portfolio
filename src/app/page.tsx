import Image from 'next/image'
import Link from 'next/link'
import HeroVisual from '@/components/portfolio/HeroVisual'
import styles from './page.module.css'

const experience = [
  {
    role: 'Developer / Business Intelligence',
    company: 'Virtumed (Pty) Ltd, Johannesburg',
    period: 'April 2024 - Present',
    description:
      'I build Power BI reports, forecasting models, and Power Apps tools for a medical device distribution team. Most of the work sits close to real operations: stock decisions, procurement, sales visibility, and the small process gaps that slow people down.',
  },
  {
    role: 'Escape Room Manager',
    company: 'Hashtag Escape, Johannesburg',
    period: 'February 2022 - March 2024',
    description:
      'I ran the rooms, looked after the technical systems, supported customers, and learned how to stay calm when something breaks five minutes before a booking. That habit followed me into development in the best way.',
  },
  {
    role: 'Waiter',
    company: 'The Fat Ginger, Johannesburg',
    period: 'June 2021 - January 2022',
    description:
      'A busy service floor taught me how to read people, communicate clearly, and keep moving without losing the details.',
  },
]

const projects = [
  {
    title: 'Inventory and sales intelligence',
    description:
      'Power BI dashboards that turn raw stock and sales numbers into clear decisions. The team can see what is selling, what is sitting still, and where to step in before a small gap turns into an expensive one.',
  },
  {
    title: 'Procurement workflow automation',
    description:
      'Power Apps and Power Automate tools that take repeated manual steps and turn them into one reliable process. Fewer copy-paste mistakes, quicker approvals, and a lot less admin getting in the way.',
  },
  {
    title: 'Modern full-stack web',
    description:
      'Real Next.js, React, and TypeScript work, including this site and the interactive builds in the Lab. It is where I am growing past dashboards into tools that a team can actually trust and maintain.',
  },
]

const skills = [
  { name: 'Power BI', level: 82, note: 'Dashboards, modelling, reporting' },
  { name: 'Power Apps', level: 86, note: 'Internal tools and workflows' },
  { name: 'Power Automate', level: 84, note: 'Process automation' },
  { name: 'SQL', level: 78, note: 'Queries and data shaping' },
  { name: 'DAX', level: 74, note: 'Measures and business logic' },
  { name: 'Next.js / React', level: 66, note: 'Portfolio and full-stack growth' },
  { name: 'TypeScript', level: 62, note: 'Typed app development' },
  { name: 'Node.js', level: 56, note: 'APIs and server-side basics' },
]

const education = [
  {
    title: 'Diploma in Systems Development',
    place: 'Boston City Campus',
    period: '2020-2023',
    detail: 'SQL, Java, Android development, PHP, HTML, CSS, and CompTIA A+ fundamentals.',
  },
  {
    title: 'National Senior Certificate',
    place: 'Jeppe High School for Boys',
    period: '2016-2020',
    detail: 'A practical base before moving into systems, support, data, and development.',
  },
]

const signals = ['DAX_OK', 'FLOW_ARMED', 'MODEL_SYNC', 'UI_SCAN', 'QUERY_READY', 'BUILD_GREEN']

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
            <p className={styles.kicker}>Power BI / Power Platform / Full-stack development</p>
            <h1>Kayden Pellegrini</h1>
            <p className={styles.tagline}>
              I turn messy processes into clear data tools and web apps, so teams can spend less time wrestling spreadsheets and more time making decisions.
            </p>
            <p className={styles.personalHook}>
              The work usually starts in the same place. A process held together by habit, a spreadsheet pushed years past what it was built for, or a question nobody can answer quickly enough. I build the thing that finally fixes it.
            </p>
            <div className={styles.signalStrip} aria-label="Current build focus">
              <span>Dashboards</span>
              <span>Automation</span>
              <span>Internal tools</span>
              <span>Full-stack</span>
            </div>

            <div className={styles.heroButtons}>
              <Link href="/showcase" className={styles.btnShowcase}>
                Explore the Build Lab
              </Link>
              <a href="/Kayden-Pellegrini-CV-2026.pdf" download="Kayden-Pellegrini-CV-2026.pdf" className={styles.btnDownload}>
                Download CV
              </a>
              <a href="https://github.com/KaydenPellegrini" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                GitHub
              </a>
              <a href="https://linkedin.com/in/kaydenpellegrini" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                LinkedIn
              </a>
              <a href="mailto:developer.kayden@gmail.com" className={styles.btnOutline}>
                Contact me
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.crypticRail} aria-hidden="true">
          {signals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
        <h2>About</h2>
        <p className={styles.summary}>
          I am a developer and business intelligence specialist based in Johannesburg, working in the medical device distribution space. My day sits close to the stock decisions, procurement, and sales numbers that keep the business moving.
        </p>
        <p>
          Most of my time goes into turning scattered business information into something people actually use. That means dashboards, forecasting models, internal tools, and automations that quietly take hours of repetitive admin off everyone&apos;s plate. I like working close to the people using it, because that is where the useful details and the real problems tend to hide.
        </p>
        <p>
          Alongside the Power BI and Power Platform work, I am building deeper full-stack skills with Next.js, React, TypeScript, and Node.js. The goal is simple. Build tools that are easy to trust, easy to maintain, and easy for a real team to pick up on a busy day.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Selected Work</h2>
        <p className={styles.sectionIntro}>
          A few places where I have turned business problems into systems people rely on every day. You can open the interactive builds in the Lab to see how they come together.
        </p>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article key={project.title} className={styles.projectCard}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
        <Link href="/showcase" className={styles.sectionCta}>
          Open the Build Lab →
        </Link>
      </section>

      <section className={styles.section}>
        <h2>Experience</h2>
        <div className={styles.cardStack}>
          {experience.map((item) => (
            <article key={`${item.role}-${item.period}`} className={styles.highlightCard}>
              <h3>{item.role}</h3>
              <p className={styles.period}>
                {item.company} - {item.period}
              </p>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Education & Skills</h2>
        <div className={styles.educationSkillsGrid}>
          <div className={styles.educationPanel}>
            <h3>Education</h3>
            <div className={styles.educationTimeline}>
              {education.map((item) => (
                <article key={item.title} className={styles.educationItem}>
                  <span>{item.period}</span>
                  <h4>{item.title}</h4>
                  <p className={styles.educationPlace}>{item.place}</p>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.skillsPanel}>
            <h3>Core Skills</h3>
            <div className={styles.skillsMeterList}>
              {skills.map((skill) => (
                <article key={skill.name} className={styles.skillMeter}>
                  <div className={styles.skillMeterHeader}>
                    <span>{skill.name}</span>
                    <strong>{skill.level}%</strong>
                  </div>
                  <div className={styles.skillTrack} aria-hidden="true">
                    <div className={styles.skillFill} style={{ width: `${skill.level}%` }} />
                  </div>
                  <p>{skill.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Edenvale / Johannesburg, South Africa - {new Date().getFullYear()}</p>
        <p>Building better tools one stubborn workflow at a time.</p>
      </footer>
    </main>
  )
}
