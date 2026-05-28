import Image from 'next/image'
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
    title: 'Inventory and sales reporting',
    description:
      'Power BI dashboards that help the team understand stock movement, sales performance, and where attention is needed before a problem becomes expensive.',
  },
  {
    title: 'Procurement workflow tools',
    description:
      'Power Apps and Power Automate work that turns repeated manual steps into cleaner internal processes with fewer copy-paste mistakes.',
  },
  {
    title: 'Modern web development',
    description:
      'A growing Next.js and TypeScript portfolio, built to move beyond dashboards into full-stack tools that are clear, maintainable, and useful.',
  },
]

const skills = ['Power BI', 'DAX', 'Power Apps', 'Power Automate', 'SQL', 'Next.js', 'React', 'TypeScript', 'Node.js']

export default function Home() {
  return (
    <main className={styles.container}>
      <section className={styles.hero}>
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
              I build practical data tools and web apps for teams that need clearer information and fewer manual steps.
            </p>
            <p className={styles.personalHook}>
              My work usually starts with a messy process, a spreadsheet that has been pushed too far, or a question nobody can answer quickly enough.
            </p>

            <div className={styles.heroButtons}>
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
        <h2>About</h2>
        <p className={styles.summary}>
          I am a developer and business intelligence specialist based in Johannesburg, currently working in the medical device distribution space.
        </p>
        <p>
          I spend a lot of time turning scattered business information into something people can actually use: dashboards, forecasting models,
          internal tools, and automations that remove repetitive admin. I like work that sits close to the people using it, because that is where
          the useful details usually live.
        </p>
        <p>
          Alongside my Power BI and Power Platform work, I am building deeper full-stack skills with Next.js, React, TypeScript, and Node.js.
          The aim is simple: build tools that are easier to trust, easier to maintain, and easier for real teams to adopt.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Selected Work</h2>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article key={project.title} className={styles.projectCard}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
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
        <div className={styles.grid}>
          <div>
            <h3>Education</h3>
            <p>
              <strong>Diploma in Systems Development</strong> - Boston City Campus, 2020-2023
            </p>
            <p>SQL, Java, Android development, PHP, HTML, CSS, and CompTIA A+ fundamentals.</p>
            <p>
              <strong>National Senior Certificate</strong> - Jeppe High School for Boys, 2016-2020
            </p>
          </div>

          <div>
            <h3>Core Skills</h3>
            <div className={styles.skillsList}>
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
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
