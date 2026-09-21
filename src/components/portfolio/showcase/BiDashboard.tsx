'use client'

import { useState } from 'react'
import { biViews, type BiChart } from '@/data/showcase/biDemo'
import styles from '@/app/showcase/showcase.module.css'

function BarChart({ chart }: { chart: Extract<BiChart, { kind: 'bars' }> }) {
  const max = Math.max(...chart.points.map((point) => point.value))
  const threshold = chart.threshold

  return (
    <div className={styles.barChart}>
      {chart.points.map((point) => {
        const atRisk = threshold ? point.value < threshold.value : false
        return (
          <div key={point.label} className={styles.barRow}>
            <span className={styles.barLabel}>{point.label}</span>
            <span className={styles.barTrack}>
              <span
                className={`${styles.barFill} ${atRisk ? styles.barRisk : ''}`}
                style={{ width: `${(point.value / max) * 100}%` }}
              />
              {threshold && (
                <span
                  className={styles.barThreshold}
                  style={{ left: `${(threshold.value / max) * 100}%` }}
                  aria-hidden="true"
                />
              )}
            </span>
            <span className={styles.barValue}>{point.value}</span>
          </div>
        )
      })}
      <p className={styles.chartFoot}>
        {chart.unit}
        {threshold ? `. ${threshold.label}: ${threshold.value}.` : '.'}
      </p>
    </div>
  )
}

function CompareChart({ chart }: { chart: Extract<BiChart, { kind: 'compare' }> }) {
  const max = Math.max(...chart.points.flatMap((point) => [point.a, point.b]))

  return (
    <div className={styles.barChart}>
      <div className={styles.chartLegend}>
        <span className={styles.legendA}>{chart.series[0]}</span>
        <span className={styles.legendB}>{chart.series[1]}</span>
      </div>
      {chart.points.map((point) => (
        <div key={point.label} className={styles.compareRow}>
          <span className={styles.barLabel}>{point.label}</span>
          <span className={styles.compareBars}>
            <span className={styles.barTrack}>
              <span className={styles.barFill} style={{ width: `${(point.a / max) * 100}%` }} />
            </span>
            <span className={styles.barTrack}>
              <span className={`${styles.barFill} ${styles.barPrior}`} style={{ width: `${(point.b / max) * 100}%` }} />
            </span>
          </span>
          <span className={styles.barValue}>
            {point.a}
            <em className={styles.priorValue}>{point.b}</em>
          </span>
        </div>
      ))}
      <p className={styles.chartFoot}>{chart.unit}.</p>
    </div>
  )
}

function Chart({ chart }: { chart: BiChart }) {
  switch (chart.kind) {
    case 'bars':
      return <BarChart chart={chart} />
    case 'compare':
      return <CompareChart chart={chart} />
  }
}

/**
 * Reconstruction of the reporting work, built on fabricated data
 * (see src/data/showcase/biDemo.ts). It is organised around the question each
 * view answers rather than around the charts, and every answer is written out in
 * full so the panel does not have to be clicked through to be understood.
 */
export default function BiDashboard() {
  const [activeId, setActiveId] = useState(biViews[0].id)
  const active = biViews.find((view) => view.id === activeId) ?? biViews[0]

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <span className={styles.syntheticBadge}>Synthetic data</span>
        <span className={styles.demoTitle}>Reporting reconstruction</span>
      </div>

      <div className={styles.questionTabs}>
        {biViews.map((view) => (
          <button
            key={view.id}
            type="button"
            className={`${styles.questionTab} ${view.id === activeId ? styles.questionTabActive : ''}`}
            aria-pressed={view.id === activeId}
            onClick={() => setActiveId(view.id)}
          >
            {view.question}
          </button>
        ))}
      </div>

      <div className={styles.answerPanel}>
        <h4 className={styles.answerQuestion}>{active.question}</h4>
        <p className={styles.answerText}>{active.answer}</p>
        <p className={styles.answerMethod}>{active.method}</p>
      </div>

      <Chart chart={active.chart} />
    </div>
  )
}
