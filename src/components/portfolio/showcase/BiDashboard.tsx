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

function ForecastChart({ chart }: { chart: Extract<BiChart, { kind: 'forecast' }> }) {
  const width = 640
  const height = 230
  const padX = 34
  const padTop = 18
  const padBottom = 40
  const values = chart.points.map((point) => point.value)
  const max = Math.max(...values) * 1.08
  const min = Math.min(...values) * 0.88
  const step = (width - padX * 2) / (chart.points.length - 1)

  const coords = chart.points.map((point, index) => ({
    ...point,
    x: padX + index * step,
    y: padTop + (1 - (point.value - min) / (max - min)) * (height - padTop - padBottom),
  }))

  const firstProjected = coords.findIndex((point) => point.projected)
  const actual = firstProjected === -1 ? coords : coords.slice(0, firstProjected)
  // Start the projected line on the last actual point so the two segments join.
  const projected = firstProjected === -1 ? [] : coords.slice(Math.max(firstProjected - 1, 0))
  const toPath = (points: typeof coords) => points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div className={styles.lineChart}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.lineSvg}
        role="img"
        aria-label={`${chart.unit} by month, with the last three months projected from the trend.`}
      >
        {firstProjected > 0 && (
          <line
            x1={coords[firstProjected].x - step / 2}
            x2={coords[firstProjected].x - step / 2}
            y1={padTop}
            y2={height - padBottom}
            className={styles.lineDivider}
          />
        )}
        <polyline points={toPath(actual)} className={styles.lineActual} />
        {projected.length > 1 && <polyline points={toPath(projected)} className={styles.lineProjected} />}
        {coords.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r={4}
            className={point.projected ? styles.dotProjected : styles.dotActual}
          />
        ))}
        {coords.map((point) => (
          <text key={point.label} x={point.x} y={height - padBottom + 20} className={styles.lineLabel}>
            {point.label}
          </text>
        ))}
      </svg>
      <p className={styles.chartFoot}>
        {chart.unit}. The dashed section is projected, not recorded.
      </p>
    </div>
  )
}

function Chart({ chart }: { chart: BiChart }) {
  switch (chart.kind) {
    case 'bars':
      return <BarChart chart={chart} />
    case 'compare':
      return <CompareChart chart={chart} />
    case 'forecast':
      return <ForecastChart chart={chart} />
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
