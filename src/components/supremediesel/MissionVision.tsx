import { missionVision } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'
import Reveal from './Reveal'

export default function MissionVision() {
  const { mission, vision } = missionVision
  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <Reveal className={styles.mv}>
          <div className={styles.mvCol}>
            <p className={styles.mvLabel}>{mission.label}</p>
            <p className={styles.mvText}>{mission.text}</p>
          </div>
          <div className={styles.mvCol}>
            <p className={styles.mvLabel}>{vision.label}</p>
            <p className={styles.mvText}>{vision.text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
