import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero – photo on top, name centered below, buttons in one row */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <img
            src="/profile.webp"
            alt="Kayden Pellegrini"
            className={styles.profileImage}
          />

          <div className={styles.heroText}>
            <h1>Kayden Pellegrini</h1>
            <p className={styles.tagline}>
              Power BI and Power Platform Developer transitioning into modern full-stack development
            </p>

            <p className={styles.personalHook}>
              They call me MacGyver with code. Give me a broken process and it will be fixed.
            </p>

            <div className={styles.heroButtons}>
              <a
                href="/Kayden-Pellegrini-CV-2026.pdf"
                download="Kayden-Pellegrini-CV-2026.pdf"
                className={styles.btnDownload}
              >
                Download CV
              </a>
              <a
                href="https://github.com/KaydenPellegrini"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/kaydenpellegrini"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSecondary}
              >
                LinkedIn
              </a>
              <a
                href="mailto:developer.kayden@gmail.com"
                className={styles.btnOutline}
              >
                Contact me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section className={styles.section}>
        <h2>Professional Summary</h2>
        <p className={styles.summary}>
          Power BI and Power Platform Developer with nearly two years of hands-on experience delivering data-driven solutions in a medical device distribution environment.
        </p>
        <p>
          Skilled in building insight-rich Power BI dashboards using DAX and forecasting models, developing custom Power Apps to automate workflows, and performing predictive stock analysis to support procurement and inventory decisions.
        </p>
        <p>
          Currently at Virtumed (Pty) Ltd, I design and deliver solutions that reduce inventory risk, improve data accuracy, and translate complex data into clear, actionable business insights. Alongside my BI work, I am actively expanding into modern full-stack development using Next.js, React, TypeScript, and Node.js, with a strong focus on writing code that is maintainable and ready for production.
        </p>
      </section>

      {/* Experience */}
      <section className={styles.section}>
        <h2>Experience</h2>

        <div className={styles.highlightCard}>
          <h3>Developer / Business Intelligence</h3>
          <p className={styles.period}>Virtumed (Pty) Ltd – Johannesburg • April 2024 – Present</p>
          <p>
            Designed and maintained Power BI dashboards for sales, inventory, and performance tracking. Built forecasting models and predictive analysis to support better stock decisions and reduce overstock or understock risks. Developed custom Power Apps solutions to automate procurement workflows and improve data accuracy. Managed vMix broadcast AV systems for events with reliable cross-site connectivity. Provided ongoing IT support and troubleshooting in a fast-moving medical environment.
          </p>
        </div>

        <div className={styles.highlightCard}>
          <h3>Escape Room Manager</h3>
          <p className={styles.period}>Hashtag Escape – Johannesburg • February 2022 – March 2024</p>
          <p>
            Ran daily operations and handled all technical systems in a high-pressure, fun environment. Sharpened quick thinking and the ability to stay calm when things inevitably go a bit sideways. Skills that transfer surprisingly well to debugging code late at night.
          </p>
        </div>

        <div className={styles.highlightCard}>
          <h3>Waiter</h3>
          <p className={styles.period}>The Fat Ginger – Johannesburg • June 2021 – January 2022</p>
          <p>
            Delivered great service in a busy team setting. Built strong communication skills and learned how to juggle multiple priorities without missing a beat.
          </p>
        </div>
      </section>

      {/* Education & Skills */}
      <section className={styles.section}>
        <h2>Education & Skills</h2>
        <div className={styles.grid}>
          <div>
            <h3>Education</h3>
            <p><strong>Diploma in Systems Development</strong> – Boston City Campus (2020–2023)</p>
            <p>SQL, Java, Android development, PHP, HTML, CSS, CompTIA A+ fundamentals.</p>
            <p><strong>National Senior Certificate</strong> – Jeppe High School for Boys (2016–2020)</p>
          </div>

          <div>
            <h3>Core Skills</h3>
            <div className={styles.skillsContainer}>
              <div className={styles.skillItem}>
                <span>Power BI (DAX, Forecasting, Dashboards)</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className={styles.skillItem}>
                <span>Power Apps & Power Automate</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className={styles.skillItem}>
                <span>Next.js & React</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className={styles.skillItem}>
                <span>TypeScript & Node.js</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '55%' }}></div>
                </div>
              </div>
              <div className={styles.skillItem}>
                <span>SQL & Data Modelling</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className={styles.skillItem}>
                <span>Java & Android Development</span>
                <div className={styles.skillBar}>
                  <div className={styles.skillLevel} style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Edenvale / Johannesburg, South Africa • {new Date().getFullYear()}</p>
        <p>From Power Automate flows to full control in code — still trying to figure out why JavaScript has 17 ways to do the same thing.</p>
      </footer>
    </div>
  );
}