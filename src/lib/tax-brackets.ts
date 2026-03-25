// SARS 2025/26 individual tax brackets (1 March 2025 – 28 February 2026)
// These are stored in Settings.taxBrackets and configurable annually.
// All amounts in CENTS.

export interface TaxBracket {
  from: number  // cents
  to: number | null  // null = top bracket
  base: number  // base tax in cents
  rate: number  // marginal rate as decimal e.g. 0.18
}

export interface TaxRebate {
  primary: number   // cents — all individuals
  secondary: number // cents — 65+
  tertiary: number  // cents — 75+
}

export const DEFAULT_BRACKETS_2526: TaxBracket[] = [
  { from: 0,          to: 23780000,  base: 0,         rate: 0.18 },
  { from: 23780001,   to: 37000000,  base: 4280400,   rate: 0.26 },
  { from: 37000001,   to: 51200000,  base: 7716400,   rate: 0.31 },
  { from: 51200001,   to: 66200000,  base: 12117800,  rate: 0.36 },
  { from: 66200001,   to: 84000000,  base: 17517800,  rate: 0.39 },
  { from: 84000001,   to: 183000000, base: 24459800,  rate: 0.41 },
  { from: 183000001,  to: null,      base: 65102800,  rate: 0.45 },
]

export const DEFAULT_REBATES_2526: TaxRebate = {
  primary:   1797700,  // R17,977
  secondary: 982800,   // R9,828
  tertiary:  327800,   // R3,278
}

// Medical aid credits (2526) — per month in cents
export const MEDICAL_CREDITS_2526 = {
  mainMember:     36400, // R364/month
  firstDependent: 36400,
  additional:     24600, // R246/month each
}

/**
 * Calculate estimated income tax for a South African individual.
 * @param taxableIncomeCents Taxable income in cents
 * @param brackets Array of tax brackets
 * @param rebates Tax rebates object
 * @param age Taxpayer age (for rebate tiers) — default 30
 */
export function calculateIncomeTax(
  taxableIncomeCents: number,
  brackets: TaxBracket[],
  rebates: TaxRebate,
  age = 30,
): {
  grossTax: number
  rebateAmount: number
  netTax: number
  effectiveRate: number
  marginalRate: number
} {
  // Find bracket
  const bracket = brackets.find(
    b => taxableIncomeCents >= b.from && (b.to === null || taxableIncomeCents <= b.to)
  ) ?? brackets[brackets.length - 1]

  const grossTax = bracket.base + Math.round((taxableIncomeCents - bracket.from) * bracket.rate)

  let rebateAmount = rebates.primary
  if (age >= 65) rebateAmount += rebates.secondary
  if (age >= 75) rebateAmount += rebates.tertiary

  const netTax = Math.max(0, grossTax - rebateAmount)
  const effectiveRate = taxableIncomeCents > 0
    ? Math.round((netTax / taxableIncomeCents) * 10000) / 100
    : 0

  return {
    grossTax,
    rebateAmount,
    netTax,
    effectiveRate,
    marginalRate: bracket.rate * 100,
  }
}

/** SARS provisional tax periods for a given tax year e.g. "2025/26" */
export function getProvisionalPeriods(taxYear: string): Array<{
  period: '1st' | '2nd' | 'topup'
  label: string
  coverageLabel: string
  deadline: Date
  warningDate: Date
}> {
  const startYear = parseInt(taxYear.split('/')[0])
  return [
    {
      period: '1st',
      label: '1st Provisional (IRP6 P1)',
      coverageLabel: `1 Mar ${startYear} – 31 Aug ${startYear}`,
      deadline: new Date(startYear, 7, 31),     // 31 August
      warningDate: new Date(startYear, 5, 1),    // 60 days before — 1 July
    },
    {
      period: '2nd',
      label: '2nd Provisional (IRP6 P2)',
      coverageLabel: `1 Mar ${startYear} – 28 Feb ${startYear + 1}`,
      deadline: new Date(startYear + 1, 1, 28), // 28 February
      warningDate: new Date(startYear, 11, 28),  // 60 days before
    },
    {
      period: 'topup',
      label: 'Top-Up (Optional)',
      coverageLabel: `Full year – adjust if income exceeded estimate`,
      deadline: new Date(startYear + 1, 8, 30), // 30 September
      warningDate: new Date(startYear + 1, 7, 1),
    },
  ]
}
