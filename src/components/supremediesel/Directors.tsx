import Image from 'next/image'
import { directors, directorsIntro } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'
import Reveal from './Reveal'

export default function Directors() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="leadership">
      <div className={styles.shell}>
        <Reveal className={styles.directorsHead}>
          <p className={styles.eyebrow}>{directorsIntro.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{directorsIntro.title}</h2>
        </Reveal>

        <Reveal className={styles.directorGrid}>
          {directors.map((director) => (
            <article key={director.name} className={styles.director}>
              <div className={styles.directorFigure}>
                <Image
                  src={director.image}
                  alt={director.name}
                  fill
                  sizes="(max-width: 560px) 92vw, 360px"
                />
              </div>
              <div className={styles.directorBody}>
                <h3 className={styles.directorName}>{director.name}</h3>
                <p className={styles.directorRole}>{director.role}</p>
                <p className={styles.directorBio}>{director.bio}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
