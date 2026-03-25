// ─── Monetary ────────────────────────────────────────────────────────────────
// All monetary values are stored as integers (cents) in MongoDB.
// R1,234.56 → 123456 in DB → "R 1 234,56" on screen

const zarFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format cents integer to ZAR string: 123456 → "R 1 234,56" */
export function formatZAR(cents: number): string {
  return zarFormatter.format(cents / 100)
}

/** Parse ZAR string to cents: "1234.56" → 123456 */
export function parseToCents(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100)
  const cleaned = value.replace(/[^0-9.]/g, '')
  return Math.round(parseFloat(cleaned || '0') * 100)
}

/** Format cents to plain decimal string for inputs: 123456 → "1234.56" */
export function centsToDecimalStr(cents: number): string {
  return (cents / 100).toFixed(2)
}

// ─── Dates ──────────────────────────────────────────────────────────────────
/** Format date to "15 Mar 2025" */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Format date to "15 Mar" (short, no year) */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
}

/** Current month key: "2025-03" */
export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Parse "2025-03" → { year: 2025, month: 3 } */
export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

/** Month display name: 2025-03 → "March 2025" */
export function monthKeyToLabel(key: string): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
}

/** Get SARS tax year for a given date: 1 Mar 2025 – 28 Feb 2026 → "2025/26" */
export function taxYearForDate(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const startYear = m >= 3 ? y : y - 1
  return `${startYear}/${String(startYear + 1).slice(-2)}`
}

/** Tax year start/end dates */
export function taxYearBounds(taxYear: string): { start: Date; end: Date } {
  const startYear = parseInt(taxYear.split('/')[0])
  return {
    start: new Date(startYear, 2, 1),   // 1 March
    end:   new Date(startYear + 1, 1, 28), // 28 Feb (close enough for queries)
  }
}

// ─── Percentages ─────────────────────────────────────────────────────────────
export function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

// ─── Colour helpers ──────────────────────────────────────────────────────────
export function utilizationColor(pctVal: number): string {
  if (pctVal >= 90) return 'text-danger'
  if (pctVal >= 70) return 'text-gold'
  return 'text-accent'
}

export function bucketColor(bucket: string): string {
  switch (bucket) {
    case 'needs':   return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'wants':   return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    case 'savings': return 'bg-accent/20 text-accent border-accent/30'
    default:        return 'bg-raised text-muted border-border'
  }
}

export function bucketBarColor(pctUsed: number): string {
  if (pctUsed > 100) return 'bg-danger'
  if (pctUsed > 95)  return 'bg-red-500'
  if (pctUsed > 85)  return 'bg-gold'
  return 'bg-accent'
}
