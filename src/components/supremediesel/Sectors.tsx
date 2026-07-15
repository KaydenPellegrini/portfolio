import Image from 'next/image'
import { sectors, sectorsIntro } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'
import Reveal from './Reveal'

export default function Sectors() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="sectors">
      <div className={styles.shell}>
        <Reveal className={styles.sectorsHead}>
          <div>
            <p className={styles.eyebrow}>{sectorsIntro.eyebrow}</p>
            <h2 className={styles.sectionTitle}>{sectorsIntro.title}</h2>
          </div>
          <p className={styles.sectorsLede}>{sectorsIntro.lede}</p>
        </Reveal>

        <Reveal className={styles.sectorGrid}>
          {sectors.map((sector) => (
            <article key={sector.id} className={styles.sectorCard}>
              <Image
                src={sector.image}
                alt={sector.name}
                fill
                sizes="(max-width: 520px) 92vw, (max-width: 900px) 46vw, 23vw"
              />
              <div className={styles.sectorBody}>
                <h3 className={styles.sectorName}>{sector.name}</h3>
                <p className={styles.sectorBlurb}>{sector.blurb}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
