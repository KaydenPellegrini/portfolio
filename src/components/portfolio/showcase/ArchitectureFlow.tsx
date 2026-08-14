import type { FlowPayload, FlowStage } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'

type Props = {
  stages: FlowStage[]
  payload?: FlowPayload
}

/**
 * A static architecture / workflow diagram. It is an ordered list, so it reads
 * correctly with a screen reader and stays understandable with no interaction,
 * no animation and no JavaScript.
 */
export default function ArchitectureFlow({ stages, payload }: Props) {
  return (
    <div className={styles.flowWrap}>
      <ol className={styles.flow}>
        {stages.map((stage, index) => (
          <li key={stage.name} className={styles.flowStage}>
            <span className={styles.flowIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className={styles.flowName}>{stage.name}</h4>
            <p className={styles.flowRole}>{stage.role}</p>
            {stage.detail && stage.detail.length > 0 && (
              <div className={styles.flowChips}>
                {stage.detail.map((item) => (
                  <span key={item} className={styles.flowChip}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>

      {payload && (
        <figure className={styles.payload}>
          <figcaption className={styles.payloadHead}>
            <span className={styles.payloadTitle}>{payload.title}</span>
            <span className={styles.payloadNote}>{payload.note}</span>
          </figcaption>
          <pre className={styles.payloadCode}>
            <code>{payload.code}</code>
          </pre>
        </figure>
      )}
    </div>
  )
}
