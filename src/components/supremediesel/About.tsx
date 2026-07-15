import Image from 'next/image'
import { about } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'
import Reveal from './Reveal'

export default function About() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.shell}>
        <Reveal className={styles.about}>
          <div className={styles.aboutBody}>
            <p className={styles.eyebrow}>{about.eyebrow}</p>
            <h2 className={`${styles.sectionTitle} ${styles.aboutTitle}`}>{about.title}</h2>
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <figure className={styles.aboutFigure}>
            <Image
              src={about.image}
              alt={about.imageAlt}
              fill
              sizes="(max-width: 820px) 92vw, 45vw"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
