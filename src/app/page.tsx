import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1>Kayden Pellegrini</h1>
        <p className={styles.tagline}>
           Power BI / Power Platform Developer • Transitioning to Modern Full-Stack
        </p>
        <div className={styles.heroButtons}>
          <a href="https://github.com/KaydenPellegrini" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            GitHub
          </a>
          <a href="https://linkedin.com/in/kaydenpellegrini" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
            LinkedIn
          </a>
          <a href="mailto:developer.kayden@gmail.com" className={styles.btnOutline}>
            Contact Me
          </a>
        </div>
      </section>

      {/* Professional Summary */}
      <section className={styles.section}>
        <h2>Professional Summary</h2>
        <p className={styles.summary}>
          Proactive  Power BI and Power Platform Developer with nearly two years of hands-on experience building insightful dashboards (DAX, forecasting models), custom Power Apps for workflow automation, and predictive stock analysis in a medical device distribution environment.
        </p>
        <p>
          Currently at Virtumed (Pty) Ltd, I deliver solutions that optimise procurement, reduce inventory risks, and turn data into actionable business decisions — skills I'm now extending into clean, scalable code with Next.js, React, TypeScript, and Node.js.
        </p>
      </section>

      {/* Key Experience Highlights */}
      <section className={styles.section}>
        <h2>Key Experience</h2>
        <div className={styles.highlights}>
          <div className={styles.highlightCard}>
            <h3>Developer / Business Intelligence – Virtumed (Pty) Ltd</h3>
            <p className={styles.period}>April 2024 – Present</p>
            <ul>
              <li>Designed & maintained Power BI dashboards for sales, inventory & performance tracking with DAX and forecasting</li>
              <li>Built custom Power Apps to automate procurement workflows & improve data accuracy</li>
              <li>Conducted predictive analysis to optimise stock levels and reduce over/understock risks</li>
              <li>Managed vMix broadcast AV systems for events, ensuring seamless cross-site delivery</li>
              <li>Provided IT troubleshooting in a fast-paced medical environment</li>
            </ul>
          </div>

          <div className={styles.highlightCard}>
            <h3>Earlier Roles</h3>
            <p className={styles.period}>2021 – 2024</p>
            <ul>
              <li>Escape Room Manager – Hashtag Escape: Honed problem-solving & technical troubleshooting under pressure</li>
              <li>Waiter – The Fat Ginger: Built strong communication & multitasking skills in team settings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Education & Skills */}
      <section className={styles.section}>
        <h2>Education & Skills</h2>
        <div className={styles.grid}>
          <div>
            <h3>Education</h3>
            <p><strong>Diploma in Systems Development</strong> – Boston City Campus (2020–2023)</p>
            <p>Covered SQL, Java, Android development, PHP, HTML/CSS + CompTIA A+ fundamentals</p>
            <p>National Senior Certificate – Jeppe High School for Boys (2016–2020)</p>
          </div>

          <div>
            <h3>Core Skills</h3>
            <ul className={styles.skillsList}>
              <li>Power BI (DAX, Dashboards, Forecasting, Data Visualisation)</li>
              <li>Power Platform (Power Apps, Power Automate, Workflows)</li>
              <li>Programming: SQL, Java, JavaScript/TypeScript, HTML/CSS, PHP</li>
              <li>AV/Broadcast: vMix (live production & streaming)</li>
              <li>Business: Stock Forecasting, Procurement Optimisation, Predictive Analysis</li>
              <li>Current Focus: Next.js, React, Node.js</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Edenvale / Johannesburg, South Africa • {new Date().getFullYear()}</p>
        <p>Building business impact — from low-code flows to full control in code</p>
      </footer>
    </div>
  );
}