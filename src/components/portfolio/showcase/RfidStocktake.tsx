'use client'

import { useEffect, useMemo, useState } from 'react'
import { expectedItems, scanStream, stocktakeName, stocktakeSummary } from '@/data/showcase/rfidDemo'
import styles from '@/app/showcase/showcase.module.css'

type FeedRow = {
  serial: string
  product: string
  status: 'confirmed' | 'duplicate' | 'unexpected'
}

const STATUS_LABEL: Record<FeedRow['status'], string> = {
  confirmed: 'Confirmed',
  duplicate: 'Repeat read ignored',
  unexpected: 'Not on list',
}

const SCAN_INTERVAL_MS = 520
const FEED_LENGTH = 7

/**
 * Reconstruction of the RFID stocktake reconciliation, built for this portfolio
 * with invented products and serial numbers (see src/data/showcase/rfidDemo.ts).
 *
 * Tags stream in, repeats are ignored rather than counted twice, tags that are
 * not on the expected list are separated out, and anything never read is left as
 * missing when the count closes. The written summary above the panel states the
 * same result, so nothing here has to be watched to be understood. Reduced
 * motion jumps straight to the closed count.
 */
export default function RfidStocktake() {
  const [processed, setProcessed] = useState(0)

  // Advances one tag at a time. Reduced motion skips straight to the closed
  // count instead of playing the stream out.
  useEffect(() => {
    if (processed >= scanStream.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(
      () => setProcessed((count) => (reduced ? scanStream.length : Math.min(count + 1, scanStream.length))),
      reduced ? 0 : SCAN_INTERVAL_MS,
    )
    return () => window.clearTimeout(timer)
  }, [processed])

  const result = useMemo(() => {
    const expectedBySerial = new Map(expectedItems.map((item) => [item.serial, item]))
    const seen = new Set<string>()
    const feed: FeedRow[] = []
    const unexpected: FeedRow[] = []
    let duplicates = 0

    for (const scan of scanStream.slice(0, processed)) {
      const known = expectedBySerial.get(scan.serial)
      const product = known?.product ?? scan.product ?? 'Unknown tag'

      if (seen.has(scan.serial)) {
        duplicates += 1
        feed.push({ serial: scan.serial, product, status: 'duplicate' })
        continue
      }

      seen.add(scan.serial)
      const row: FeedRow = {
        serial: scan.serial,
        product,
        status: known ? 'confirmed' : 'unexpected',
      }
      feed.push(row)
      if (!known) unexpected.push(row)
    }

    return {
      feed,
      duplicates,
      unexpected,
      confirmed: expectedItems.filter((item) => seen.has(item.serial)),
      outstanding: expectedItems.filter((item) => !seen.has(item.serial)),
      seen,
    }
  }, [processed])

  const done = processed >= scanStream.length
  const outstandingLabel = done ? 'Missing' : 'Not yet read'

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <span className={styles.syntheticBadge}>Synthetic data</span>
        <span className={styles.demoTitle}>{stocktakeName}</span>
      </div>

      <p className={styles.demoSummary}>{stocktakeSummary}</p>

      <div className={styles.demoControls}>
        <button type="button" className={styles.buildBtn} onClick={() => setProcessed(0)}>
          {done ? 'Run the count again' : 'Restart count'}
        </button>
        <span className={styles.buildProgress}>
          {processed}/{scanStream.length} tags read
        </span>
      </div>

      <div className={styles.rfidGrid}>
        <div className={styles.scanFeed} aria-hidden="true">
          <div className={styles.codeHead}>Scanner feed</div>
          {result.feed.length === 0 && <p className={styles.scanEmpty}>Waiting for the first tag.</p>}
          {result.feed
            .slice(-FEED_LENGTH)
            .reverse()
            .map((row, index) => (
              <div key={`${row.serial}-${result.feed.length - index}`} className={styles.scanRow}>
                <span className={styles.scanSerial}>{row.serial}</span>
                <span className={`${styles.statusChip} ${styles[row.status]}`}>{STATUS_LABEL[row.status]}</span>
              </div>
            ))}
        </div>

        <div className={styles.tallyPanel}>
          <div className={styles.codeHead}>Reconciliation</div>
          <dl className={styles.tallyList}>
            <div className={styles.tally}>
              <dt>Expected</dt>
              <dd>{expectedItems.length}</dd>
            </div>
            <div className={styles.tally}>
              <dt>Confirmed</dt>
              <dd className={styles.tallyGood}>{result.confirmed.length}</dd>
            </div>
            <div className={styles.tally}>
              <dt>{outstandingLabel}</dt>
              <dd className={result.outstanding.length > 0 && done ? styles.tallyRisk : undefined}>
                {result.outstanding.length}
              </dd>
            </div>
            <div className={styles.tally}>
              <dt>Unexpected</dt>
              <dd className={result.unexpected.length > 0 ? styles.tallyWarn : undefined}>
                {result.unexpected.length}
              </dd>
            </div>
            <div className={styles.tally}>
              <dt>Repeat reads ignored</dt>
              <dd>{result.duplicates}</dd>
            </div>
          </dl>

          <p className={styles.demoStatus} aria-live="polite">
            {done
              ? 'Count closed. This is the point where the movement and audit records are written and the HTML email and printable reports go out.'
              : 'Reading tags. Repeats are matched against what has already been counted.'}
          </p>
        </div>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.demoTable}>
          <caption className={styles.tableCaption}>
            Stocktake result. Invented products and serial numbers.
          </caption>
          <thead>
            <tr>
              <th scope="col">Serial</th>
              <th scope="col">Product</th>
              <th scope="col">Location</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {expectedItems.map((item) => {
              const counted = result.seen.has(item.serial)
              return (
                <tr key={item.serial}>
                  <td className={styles.mono}>{item.serial}</td>
                  <td>{item.product}</td>
                  <td>{item.location}</td>
                  <td>
                    <span
                      className={`${styles.statusChip} ${counted ? styles.confirmed : done ? styles.missing : styles.pending}`}
                    >
                      {counted ? 'Confirmed' : done ? 'Missing' : 'Not yet read'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {result.unexpected.map((row) => (
              <tr key={row.serial}>
                <td className={styles.mono}>{row.serial}</td>
                <td>{row.product}</td>
                <td>Not expected here</td>
                <td>
                  <span className={`${styles.statusChip} ${styles.unexpected}`}>Unexpected</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
