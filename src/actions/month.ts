'use server'

import { connectDB } from '@/lib/db'
import { Month } from '@/models/Month'
import { IncomeEntry } from '@/models/IncomeEntry'
import { Expense } from '@/models/Expense'
import { RecurringExpense } from '@/models/RecurringExpense'
import { Settings } from '@/models/Settings'
import { currentMonthKey, taxYearForDate } from '@/lib/format'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

/** Ensure current month document exists, creating it if needed */
export async function ensureCurrentMonth() {
  await connectDB()
  const key = currentMonthKey()
  const { year, month } = { year: parseInt(key.split('-')[0]), month: parseInt(key.split('-')[1]) }

  let doc = await Month.findOne({ monthKey: key })
  if (!doc) {
    const settings = await Settings.findOne().lean()
    doc = await Month.create({
      year, month, monthKey: key,
      allocationRules: settings?.defaultBucketAllocation ?? { needs: 50, wants: 30, savings: 20 },
    })
  }
  return JSON.parse(JSON.stringify(doc))
}

/** Get all months (for picker), sorted descending */
export async function getMonths() {
  await connectDB()
  const months = await Month.find().sort({ year: -1, month: -1 }).lean()
  return JSON.parse(JSON.stringify(months))
}

/** Get full dashboard data for a month key */
export async function getMonthDashboard(monthKey: string) {
  await connectDB()

  const month = await Month.findOne({ monthKey }).lean()
  if (!month) return null

  const [incomeEntries, expenses, settings] = await Promise.all([
    IncomeEntry.find({ monthKey }).sort({ date: -1 }).lean(),
    Expense.find({ monthKey, deletedAt: null }).sort({ date: -1 }).lean(),
    Settings.findOne().lean(),
  ])

  // Income aggregation
  const grossIncomeCents = incomeEntries.reduce((s, e) => s + e.amountCents, 0)
const taxReservePct = 0
const taxReserveCents = 0
const spendableNetCents = grossIncomeCents

  // Bucket allocation
  const allocation = (month as any).allocationRules ?? { needs: 50, wants: 30, savings: 20 }
  const bucketAllocated = {
    needs:   Math.round(spendableNetCents * allocation.needs / 100),
    wants:   Math.round(spendableNetCents * allocation.wants / 100),
    savings: Math.round(spendableNetCents * allocation.savings / 100),
  }

  // Bucket spend
  const bucketSpend = { needs: 0, wants: 0, savings: 0 }
  for (const e of expenses as any[]) {
    bucketSpend[e.bucket as keyof typeof bucketSpend] += e.amountCents
  }

  return {
    month: JSON.parse(JSON.stringify(month)),
    incomeEntries: JSON.parse(JSON.stringify(incomeEntries)),
    expenses: JSON.parse(JSON.stringify(expenses)),
    summary: {
      grossIncomeCents,
      taxReservePct,
      taxReserveCents,
      spendableNetCents,
      bucketAllocated,
      bucketSpend,
    },
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  }
}

/** Update bucket allocation for a month */
export async function updateMonthAllocation(
  monthKey: string,
  allocation: { needs: number; wants: number; savings: number }
) {
  await connectDB()
  if (allocation.needs + allocation.wants + allocation.savings !== 100) {
    return { success: false, error: 'Allocations must sum to 100%' }
  }
  await Month.findOneAndUpdate({ monthKey }, { allocationRules: allocation })
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

/** Close a month */
export async function closeMonth(monthKey: string) {
  await connectDB()
  const month = await Month.findOne({ monthKey })
  if (!month) return { success: false, error: 'Month not found' }
  if (month.status === 'closed') return { success: false, error: 'Already closed' }

  const data = await getMonthDashboard(monthKey)
  if (!data) return { success: false, error: 'No data' }

  const { summary } = data
  month.status = 'closed'
  month.closedAt = new Date()
  month.closeSummary = {
    grossIncome:  summary.grossIncomeCents,
    spendableNet: summary.spendableNetCents,
    taxReserve:   summary.taxReserveCents,
    totalSpend:   summary.bucketSpend.needs + summary.bucketSpend.wants + summary.bucketSpend.savings,
    byBucket:     summary.bucketSpend,
    netPosition:  summary.spendableNetCents -
      (summary.bucketSpend.needs + summary.bucketSpend.wants + summary.bucketSpend.savings),
  }
  await month.save()

  // Auto-create next month
  await ensureCurrentMonth()

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

/** Get upcoming recurring expenses (next 14 days) */
export async function getUpcomingRecurrings() {
  await connectDB()
  const now = new Date()
  const in14 = new Date(now)
  in14.setDate(in14.getDate() + 14)

  const recurrings = await RecurringExpense.find({
    isActive: true,
    $or: [
      { nextDueDate: { $lte: in14 } },
      { nextDueDate: null },
    ],
  }).lean()

  return JSON.parse(JSON.stringify(recurrings))
}

/** Confirm a recurring — creates an expense from it */
export async function confirmRecurring(recurringId: string, overrideAmountCents?: number) {
  await connectDB()
  const rec = await RecurringExpense.findById(recurringId)
  if (!rec) return { success: false, error: 'Not found' }

  const monthKey = currentMonthKey()
  await ensureCurrentMonth()
  const month = await Month.findOne({ monthKey })
  if (!month) return { success: false, error: 'Month not found' }

  const taxYear = taxYearForDate(new Date())
  const amount = overrideAmountCents ?? rec.amountCents

  const expense = await Expense.create({
    monthId: month._id,
    monthKey,
    taxYear,
    amountCents: amount,
    date: new Date(),
    vendor: rec.name,
    categoryId: rec.categoryId,
    categoryLabel: rec.categoryLabel,
    bucket: rec.bucket,
    description: `${rec.name} (recurring)`,
    paymentMethod: rec.paymentMethod,
    cardId: rec.cardId,
    isDeductible: rec.isDeductible,
    receiptRequired: false,
    isForeignCurrency: false,
  })

  // Update next due date
  const next = new Date()
  next.setMonth(next.getMonth() + 1)
  next.setDate(rec.dueDay)
  rec.lastProcessedDate = new Date()
  rec.nextDueDate = next
  await rec.save()

  // Update card balance if linked
  if (rec.cardId) {
    const { CreditCard } = await import('@/models/CreditCard')
    const { CardTransaction } = await import('@/models/CardTransaction')
    const card = await CreditCard.findById(rec.cardId)
    if (card) {
      card.currentBalanceCents += amount
      await card.save()
      await CardTransaction.create({
        cardId: rec.cardId,
        expenseId: expense._id,
        type: 'charge',
        amountCents: amount,
        date: new Date(),
        description: rec.name,
        runningBalanceCents: card.currentBalanceCents,
      })
    }
  }

  revalidatePath(`/${TOKEN}`)
  return { success: true, expenseId: expense._id.toString() }
}
