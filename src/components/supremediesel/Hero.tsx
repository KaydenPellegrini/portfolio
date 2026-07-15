import Image from 'next/image'
import { brand, stats } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'

export default function Hero() {
  const { hero } = brand
  return (
    <>
      <section className={styles.hero} id="top">
        <Image
          src={hero.image}
          alt="Industrial refinery at dusk"
          fill
          priority
          sizes="100vw"
          className={styles.heroBg}
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}>{hero.eyebrow}</p>
            <h1 className={styles.heroTitle}>{hero.title}</h1>
            <p className={styles.heroLede}>{hero.lede}</p>
            <div className={styles.heroCtas}>
              <a href={hero.primaryCta.href} className={styles.btnPrimary}>
                {hero.primaryCta.label}
              </a>
              <a href={hero.secondaryCta.href} className={styles.btnGhost}>
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.stats}>
        <div className={styles.statsInner}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
