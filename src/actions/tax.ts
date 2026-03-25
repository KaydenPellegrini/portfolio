'use server'

import { connectDB } from '@/lib/db'
import { IncomeEntry } from '@/models/IncomeEntry'
import { Expense } from '@/models/Expense'
import { Month } from '@/models/Month'
import { Settings } from '@/models/Settings'
import { TaxPeriodSnapshot } from '@/models/TaxPeriodSnapshot'
import { calculateIncomeTax, getProvisionalPeriods } from '@/lib/tax-brackets'
import { taxYearBounds } from '@/lib/format'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

export async function getTaxPageData(taxYear: string) {
  await connectDB()
  const settings = await Settings.findOne().lean()
  const { start, end } = taxYearBounds(taxYear)

  const [incomeEntries, deductibleExpenses, allExpenses, snapshots] = await Promise.all([
    IncomeEntry.find({ taxYear }).lean(),
    Expense.find({ taxYear, isDeductible: true, deletedAt: null }).lean(),
    Expense.find({ taxYear, deletedAt: null }).lean(),
    TaxPeriodSnapshot.find({ taxYear }).sort({ calculatedAt: -1 }).lean(),
  ])

  const grossIncomeCents = incomeEntries.reduce((s, e) => s + e.amountCents, 0)
  const totalDeductionsCents = deductibleExpenses.reduce((s, e) => s + e.amountCents, 0)
  const estimatedTaxableIncomeCents = Math.max(0, grossIncomeCents - totalDeductionsCents)

  const brackets = settings?.taxBrackets ?? []
  const rebates = settings?.taxRebates ?? { primary: 1797700, secondary: 982800, tertiary: 327800 }
  const taxCalc = calculateIncomeTax(estimatedTaxableIncomeCents, brackets as any, rebates as any)

  // Estimate annualised taxable income
  const now = new Date()
  const monthsElapsed = Math.max(1,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1
  )
  const annualisedTaxableIncomeCents = Math.round(estimatedTaxableIncomeCents / monthsElapsed * 12)
  const annualisedTaxCalc = calculateIncomeTax(annualisedTaxableIncomeCents, brackets as any, rebates as any)

  // Tax reserve accumulated across months in this tax year
  const months = await Month.find({
    $or: [
      { year: parseInt(taxYear.split('/')[0]), month: { $gte: 3 } },
      { year: parseInt(taxYear.split('/')[1].replace(/^\d{2}/, match => {
          const full = parseInt(taxYear.split('/')[0])
          return String(full + 1).slice(0, 2) + match
        })), month: { $lte: 2 } },
    ],
  }).lean()

  const taxReservePct = settings?.taxReservePct ?? 30
  let taxReserveAccumulatedCents = 0
  for (const m of months) {
    const mIncome = await IncomeEntry.find({ monthKey: (m as any).monthKey }).lean()
    const mGross = mIncome.reduce((s, e) => s + e.amountCents, 0)
    taxReserveAccumulatedCents += Math.round(mGross * taxReservePct / 100)
  }

  const receiptOverrideCount = allExpenses.filter((e: any) => e.receiptRequired && !e.receiptUrl).length

  // Period 1: March–August
  const startYear = parseInt(taxYear.split('/')[0])
  const period1Expenses = deductibleExpenses.filter((e: any) => {
    const d = new Date(e.date)
    return d >= new Date(startYear, 2, 1) && d <= new Date(startYear, 7, 31)
  })
  const period1Income = incomeEntries.filter((e: any) => {
    const d = new Date(e.date)
    return d >= new Date(startYear, 2, 1) && d <= new Date(startYear, 7, 31)
  })
  const p1Gross = period1Income.reduce((s, e) => s + e.amountCents, 0)
  const p1Deductions = period1Expenses.reduce((s, e) => s + e.amountCents, 0)

  const periods = getProvisionalPeriods(taxYear)

  return {
    taxYear,
    grossIncomeCents,
    totalDeductionsCents,
    estimatedTaxableIncomeCents,
    taxCalc,
    annualisedTaxableIncomeCents,
    annualisedTaxCalc,
    taxReserveAccumulatedCents,
    taxReservePct,
    receiptOverrideCount,
    deductibleExpenses: JSON.parse(JSON.stringify(deductibleExpenses)),
    allExpenses: JSON.parse(JSON.stringify(allExpenses)),
    snapshots: JSON.parse(JSON.stringify(snapshots)),
    periods,
    period1Summary: { grossCents: p1Gross, deductionsCents: p1Deductions },
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  }
}

export async function saveTaxSnapshot(input: {
  taxYear: string
  period: '1st' | '2nd' | 'topup' | 'ytd'
  label?: string
}) {
  await connectDB()
  const data = await getTaxPageData(input.taxYear)
  if (!data) return { success: false, error: 'No data' }

  await TaxPeriodSnapshot.create({
    taxYear: input.taxYear,
    period: input.period,
    grossIncomeCents: data.grossIncomeCents,
    totalDeductionsCents: data.totalDeductionsCents,
    estimatedTaxableIncomeCents: data.estimatedTaxableIncomeCents,
    estimatedTaxCents: data.taxCalc.netTax,
    taxReserveAccumulatedCents: data.taxReserveAccumulatedCents,
    deductibleExpenseCount: data.deductibleExpenses.length,
    receiptOverrideCount: data.receiptOverrideCount,
    snapshotLabel: input.label,
    calculatedAt: new Date(),
  })

  revalidatePath(`/${TOKEN}/tax`)
  return { success: true }
}

export async function getAnalyticsData(months = 12) {
  await connectDB()
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)

  const [expenses, incomeEntries] = await Promise.all([
    Expense.find({ date: { $gte: cutoff }, deletedAt: null })
      .sort({ date: 1 }).lean(),
    IncomeEntry.find({ date: { $gte: cutoff } }).sort({ date: 1 }).lean(),
  ])

  return {
    expenses: JSON.parse(JSON.stringify(expenses)),
    incomeEntries: JSON.parse(JSON.stringify(incomeEntries)),
  }
}
