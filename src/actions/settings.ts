'use server'

import { connectDB } from '@/lib/db'
import { Settings } from '@/models/Settings'
import { RecurringExpense } from '@/models/RecurringExpense'
import { parseToCents } from '@/lib/format'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

export async function getSettings() {
  await connectDB()
  const s = await Settings.findOne().lean()
  if (!s) {
    const created = await Settings.create({})
    return JSON.parse(JSON.stringify(created))
  }
  return JSON.parse(JSON.stringify(s))
}

export async function updateSettings(input: {
  hourlyRateStr?: string
  taxReservePct?: number
  defaultBucketAllocation?: { needs: number; wants: number; savings: number }
  businessPhonePct?: number
  homeOfficePct?: number
  filingReminders?: boolean
  currentTaxYear?: string
}) {
  await connectDB()
  const set: Record<string, unknown> = { updatedAt: new Date() }

  if (input.hourlyRateStr) set.hourlyRateCents = parseToCents(input.hourlyRateStr)
  if (input.taxReservePct !== undefined) set.taxReservePct = input.taxReservePct
  if (input.defaultBucketAllocation) {
    const a = input.defaultBucketAllocation
    if (a.needs + a.wants + a.savings !== 100)
      return { success: false, error: 'Allocations must sum to 100%' }
    set.defaultBucketAllocation = a
  }
  if (input.businessPhonePct !== undefined) set.businessPhonePct = input.businessPhonePct
  if (input.homeOfficePct !== undefined) set.homeOfficePct = input.homeOfficePct
  if (input.filingReminders !== undefined) set.filingReminders = input.filingReminders
  if (input.currentTaxYear) set.currentTaxYear = input.currentTaxYear

  await Settings.findOneAndUpdate({}, { $set: set }, { upsert: true })
  revalidatePath(`/${TOKEN}`)
  revalidatePath(`/${TOKEN}/settings`)
  return { success: true }
}

// ─── Recurring Expenses ───────────────────────────────────────────────────────
export async function getRecurrings() {
  await connectDB()
  const recurrings = await RecurringExpense.find().sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(recurrings))
}

export async function addRecurring(input: {
  name: string
  amountStr: string
  frequency: string
  dueDay: number
  categoryId: string
  categoryLabel: string
  bucket: string
  paymentMethod: string
  cardId?: string
  isDeductible: boolean
}) {
  await connectDB()
  const amountCents = parseToCents(input.amountStr)
  if (amountCents <= 0) return { success: false, error: 'Amount must be positive' }

  // Compute next due date
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), input.dueDay)
  if (next < now) next.setMonth(next.getMonth() + 1)

  await RecurringExpense.create({
    name: input.name,
    amountCents,
    frequency: input.frequency,
    dueDay: input.dueDay,
    categoryId: input.categoryId,
    categoryLabel: input.categoryLabel,
    bucket: input.bucket,
    paymentMethod: input.paymentMethod,
    cardId: input.cardId || undefined,
    isDeductible: input.isDeductible,
    nextDueDate: next,
  })

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function updateRecurring(id: string, input: {
  name?: string
  amountStr?: string
  dueDay?: number
  isActive?: boolean
}) {
  await connectDB()
  const set: Record<string, unknown> = {}
  if (input.name) set.name = input.name
  if (input.amountStr) set.amountCents = parseToCents(input.amountStr)
  if (input.dueDay) set.dueDay = input.dueDay
  if (input.isActive !== undefined) set.isActive = input.isActive
  await RecurringExpense.findByIdAndUpdate(id, { $set: set })
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function deleteRecurring(id: string) {
  await connectDB()
  await RecurringExpense.findByIdAndDelete(id)
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}
