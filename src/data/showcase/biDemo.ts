/**
 * Synthetic data for the reporting and forecasting reconstruction.
 *
 * Every number, site, group and trend below is fabricated for this portfolio.
 * Labels are deliberately generic (Site A, Group A) rather than realistic place
 * or product names, so nothing can be read as describing a real business. The
 * point of the panel is the analytical question each view answers.
 */

export type BiChart =
  | {
      kind: 'bars'
      unit: string
      threshold?: { value: number; label: string }
      points: { label: string; value: number }[]
    }
  | {
      kind: 'compare'
      unit: string
      series: [string, string]
      points: { label: string; a: number; b: number }[]
    }
  | {
      kind: 'forecast'
      unit: string
      points: { label: string; value: number; projected?: boolean }[]
    }

export type BiView = {
  id: string
  /** The question the report exists to answer. */
  question: string
  /** The answer this fabricated data set gives. */
  answer: string
  /** How the real report gets to that answer. */
  method: string
  chart: BiChart
}

export const biViews: BiView[] = [
  {
    id: 'stock-risk',
    question: 'Which sites are carrying stock risk?',
    answer:
      'Two sites are below the cover threshold. Site A has four days of cover and Site B has six, so both need replenishment before the others are looked at.',
    method:
      'Stock on hand per site is measured against recent consumption to give days of cover, and anything under the threshold is flagged for replenishment.',
    chart: {
      kind: 'bars',
      unit: 'days of cover',
      threshold: { value: 10, label: 'Replenishment threshold' },
      points: [
        { label: 'Site A', value: 4 },
        { label: 'Site B', value: 6 },
        { label: 'Site C', value: 12 },
        { label: 'Site D', value: 17 },
        { label: 'Site E', value: 21 },
        { label: 'Site F', value: 26 },
      ],
    },
  },
  {
    id: 'sales-activity',
    question: 'How is sales activity tracking against the same period last year?',
    answer:
      'Four of the six groups are ahead of last year. Group C is the one to look at, down against a strong prior period, while Group E has grown the most in absolute terms.',
    method:
      'Invoiced units are grouped by product group and compared against the matching period in the previous year, so a group is read against its own history rather than against the overall average.',
    chart: {
      kind: 'compare',
      unit: 'units invoiced',
      series: ['This year', 'Last year'],
      points: [
        { label: 'Group A', a: 148, b: 132 },
        { label: 'Group B', a: 121, b: 118 },
        { label: 'Group C', a: 96, b: 127 },
        { label: 'Group D', a: 134, b: 129 },
        { label: 'Group E', a: 171, b: 140 },
        { label: 'Group F', a: 88, b: 94 },
      ],
    },
  },
  {
    id: 'forecast',
    question: 'What does demand look like next quarter if the trend holds?',
    answer:
      'The projection continues upward into the next three months, so the replenishment plan is built against the projected figures rather than the current stock position alone.',
    method:
      'Historical sales for the product group are used to project the next three months, and the projection is read next to current stock cover when planning purchase orders.',
    chart: {
      kind: 'forecast',
      unit: 'units per month',
      points: [
        { label: 'Sep', value: 310 },
        { label: 'Oct', value: 338 },
        { label: 'Nov', value: 352 },
        { label: 'Dec', value: 301 },
        { label: 'Jan', value: 364 },
        { label: 'Feb', value: 389 },
        { label: 'Mar', value: 402, projected: true },
        { label: 'Apr', value: 418, projected: true },
        { label: 'May', value: 431, projected: true },
      ],
    },
  },
]
