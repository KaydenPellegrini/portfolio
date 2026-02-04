import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
  <h1>Kayden Pellegrini</h1>
  <p className={styles.tagline}>
    Power BI and Power Platform Developer transitioning into modern full-stack development
  </p>
  <div className={styles.heroButtons}>
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
</section>

      {/* Professional Summary */}
      <section className={styles.section}>
        <h2>Professional Summary</h2>
        <p className={styles.summary}>
          Power BI and Power Platform Developer with nearly two years of hands-on experience building dashboards, forecasting models, and custom automation solutions in a medical device distribution environment.
        </p>
        <p>
          At Virtumed I create data-driven solutions that optimise stock procurement, streamline operations, and turn complex data into clear business decisions. I am now extending those same problem-solving skills into modern full-stack development with Next.js, React, TypeScript, and Node.js.
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
            Ran daily operations and handled all technical systems in a high-pressure, fun environment. Sharpened quick thinking and the ability to stay calm when things inevitably go a bit sideways (turns out those skills help a lot when debugging at 2 a.m.).
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
            <ul className={styles.skillsList}>
              <li>Power BI (dashboards, DAX, forecasting models, data visualisation)</li>
              <li>Power Platform (Power Apps, Power Automate, workflow automation)</li>
              <li>Programming foundations: SQL, Java, JavaScript/TypeScript, HTML, CSS, PHP</li>
              <li>AV & broadcast: vMix (live production and streaming setups)</li>
              <li>Business domain: stock forecasting, procurement optimisation, predictive analysis</li>
              <li>Current focus: Next.js, React, Node.js</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Edenvale / Johannesburg, South Africa • {new Date().getFullYear()}</p>
        <p>From Power Automate flows to full control in code — still figuring out why JavaScript insists on having seven ways to do the same thing.</p>
      </footer>
    </div>
  );
}