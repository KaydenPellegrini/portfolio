'use server'

import { connectDB } from '@/lib/db'
import { Expense } from '@/models/Expense'
import { Month } from '@/models/Month'
import { CreditCard } from '@/models/CreditCard'
import { CardTransaction } from '@/models/CardTransaction'
import { ensureCurrentMonth } from './month'
import { currentMonthKey, taxYearForDate, parseToCents } from '@/lib/format'
import { BUILT_IN_CATEGORIES } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

export interface AddExpenseInput {
  amountStr: string
  date: string
  vendor?: string
  categoryId: string
  bucket: string
  description: string
  paymentMethod: string
  cardId?: string
  isDeductible: boolean
  receiptUrl?: string
  receiptOverrideReason?: string
  isForeignCurrency?: boolean
  foreignCurrency?: string
  foreignAmountStr?: string
  exchangeRateStr?: string
  monthKey?: string
}

export async function addExpense(input: AddExpenseInput) {
  await connectDB()
  const monthKey = input.monthKey ?? currentMonthKey()
  await ensureCurrentMonth()
  const month = await Month.findOne({ monthKey })
  if (!month) return { success: false, error: 'Month not found' }
  if (month.status === 'closed') return { success: false, error: 'Month is closed — cannot add expenses' }

  const amountCents = parseToCents(input.amountStr)
  if (amountCents <= 0) return { success: false, error: 'Amount must be positive' }

  const categoryDef = BUILT_IN_CATEGORIES.find(c => c.id === input.categoryId)
  const receiptRequired = categoryDef?.receiptRequired ?? false

  // Receipt validation
  if (receiptRequired && !input.receiptUrl && !input.receiptOverrideReason) {
    return { success: false, error: 'receipt_required' }
  }

  // Duplicate detection (same vendor + amount + date ±1 day)
  if (input.vendor) {
    const d = new Date(input.date)
    const from = new Date(d); from.setDate(d.getDate() - 1)
    const to = new Date(d);   to.setDate(d.getDate() + 1)
    const dup = await Expense.findOne({
      monthKey,
      vendor: input.vendor,
      amountCents,
      date: { $gte: from, $lte: to },
      deletedAt: null,
    })
    if (dup) {
      return { success: false, error: 'duplicate_warning', duplicateId: dup._id.toString() }
    }
  }

  const taxYear = taxYearForDate(new Date(input.date))
  const foreignAmountCents = input.foreignAmountStr ? parseToCents(input.foreignAmountStr) : undefined

  const expense = await Expense.create({
    monthId: month._id,
    monthKey,
    taxYear,
    amountCents,
    date: new Date(input.date),
    vendor: input.vendor,
    categoryId: input.categoryId,
    categoryLabel: categoryDef?.label ?? input.categoryId,
    bucket: input.bucket,
    description: input.description,
    paymentMethod: input.paymentMethod,
    cardId: input.cardId || undefined,
    isDeductible: input.isDeductible,
    receiptUrl: input.receiptUrl,
    receiptRequired,
    receiptOverrideReason: input.receiptOverrideReason,
    isForeignCurrency: input.isForeignCurrency ?? false,
    foreignCurrency: input.foreignCurrency,
    foreignAmount: foreignAmountCents,
    exchangeRate: input.exchangeRateStr ? parseFloat(input.exchangeRateStr) : undefined,
  })

  // Update card balance if payment was on card
  if (input.cardId && (input.paymentMethod === 'credit' || input.paymentMethod === 'store_card')) {
    const card = await CreditCard.findById(input.cardId)
    if (card) {
      card.currentBalanceCents += amountCents
      await card.save()
      await CardTransaction.create({
        cardId: input.cardId,
        expenseId: expense._id,
        type: 'charge',
        amountCents,
        date: new Date(input.date),
        description: input.description,
        runningBalanceCents: card.currentBalanceCents,
      })
    }
  }

  revalidatePath(`/${TOKEN}`)
  return { success: true, expenseId: expense._id.toString() }
}

/** Force-add expense even if duplicate warning was shown */
export async function addExpenseForce(input: AddExpenseInput) {
  const safeInput = { ...input, _skipDupCheck: true }
  // Re-route without duplicate check by calling core logic directly
  return _createExpense(safeInput)
}

async function _createExpense(input: AddExpenseInput & { _skipDupCheck?: boolean }) {
  const monthKey = input.monthKey ?? currentMonthKey()
  const month = await Month.findOne({ monthKey })
  if (!month) return { success: false, error: 'Month not found' }

  const amountCents = parseToCents(input.amountStr)
  const categoryDef = BUILT_IN_CATEGORIES.find(c => c.id === input.categoryId)
  const receiptRequired = categoryDef?.receiptRequired ?? false
  const taxYear = taxYearForDate(new Date(input.date))

  const expense = await Expense.create({
    monthId: month._id, monthKey, taxYear, amountCents,
    date: new Date(input.date), vendor: input.vendor,
    categoryId: input.categoryId, categoryLabel: categoryDef?.label ?? input.categoryId,
    bucket: input.bucket, description: input.description,
    paymentMethod: input.paymentMethod, cardId: input.cardId || undefined,
    isDeductible: input.isDeductible, receiptUrl: input.receiptUrl,
    receiptRequired, receiptOverrideReason: input.receiptOverrideReason,
    isForeignCurrency: input.isForeignCurrency ?? false,
  })

  if (input.cardId && (input.paymentMethod === 'credit' || input.paymentMethod === 'store_card')) {
    const card = await CreditCard.findById(input.cardId)
    if (card) {
      card.currentBalanceCents += amountCents
      await card.save()
      await CardTransaction.create({
        cardId: input.cardId, expenseId: expense._id,
        type: 'charge', amountCents, date: new Date(input.date),
        description: input.description, runningBalanceCents: card.currentBalanceCents,
      })
    }
  }

  revalidatePath(`/${TOKEN}`)
  return { success: true, expenseId: expense._id.toString() }
}

export async function deleteExpense(id: string) {
  await connectDB()
  const expense = await Expense.findById(id)
  if (!expense) return { success: false, error: 'Not found' }
  const month = await Month.findById(expense.monthId)
  if (month?.status === 'closed') return { success: false, error: 'Month is closed' }

  // Reverse card balance
  if (expense.cardId && (expense.paymentMethod === 'credit' || expense.paymentMethod === 'store_card')) {
    const card = await CreditCard.findById(expense.cardId)
    if (card) {
      card.currentBalanceCents = Math.max(0, card.currentBalanceCents - expense.amountCents)
      await card.save()
    }
    await CardTransaction.deleteOne({ expenseId: expense._id })
  }

  expense.deletedAt = new Date()
  await expense.save()
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function updateExpense(id: string, input: Partial<AddExpenseInput>) {
  await connectDB()
  const expense = await Expense.findById(id)
  if (!expense) return { success: false, error: 'Not found' }
  const month = await Month.findById(expense.monthId)
  if (month?.status === 'closed') return { success: false, error: 'Month is closed' }

  const oldAmount = expense.amountCents
  const newAmount = input.amountStr ? parseToCents(input.amountStr) : oldAmount
  const categoryDef = input.categoryId
    ? BUILT_IN_CATEGORIES.find(c => c.id === input.categoryId)
    : BUILT_IN_CATEGORIES.find(c => c.id === expense.categoryId)

  if (input.amountStr)    expense.amountCents = newAmount
  if (input.date)         expense.date = new Date(input.date)
  if (input.vendor !== undefined) expense.vendor = input.vendor
  if (input.categoryId) { expense.categoryId = input.categoryId; expense.categoryLabel = categoryDef?.label ?? input.categoryId }
  if (input.bucket)       expense.bucket = input.bucket as any
  if (input.description)  expense.description = input.description
  if (input.paymentMethod) expense.paymentMethod = input.paymentMethod as any
  if (input.isDeductible !== undefined) expense.isDeductible = input.isDeductible
  if (input.receiptUrl !== undefined) expense.receiptUrl = input.receiptUrl

  await expense.save()

  // Adjust card balance if amount changed
  if (expense.cardId && newAmount !== oldAmount) {
    const card = await CreditCard.findById(expense.cardId)
    if (card) {
      card.currentBalanceCents = card.currentBalanceCents - oldAmount + newAmount
      await card.save()
    }
  }

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function getExpenses(monthKey: string, includeDeleted = false) {
  await connectDB()
  const filter: Record<string, unknown> = { monthKey }
  if (!includeDeleted) filter.deletedAt = null
  const expenses = await Expense.find(filter).sort({ date: -1 }).lean()
  return JSON.parse(JSON.stringify(expenses))
}

export async function bulkUpdateExpenses(
  ids: string[],
  update: { bucket?: string; isDeductible?: boolean; categoryId?: string }
) {
  await connectDB()
  const set: Record<string, unknown> = {}
  if (update.bucket) set.bucket = update.bucket
  if (update.isDeductible !== undefined) set.isDeductible = update.isDeductible
  if (update.categoryId) {
    set.categoryId = update.categoryId
    const cat = BUILT_IN_CATEGORIES.find(c => c.id === update.categoryId)
    if (cat) set.categoryLabel = cat.label
  }
  await Expense.updateMany({ _id: { $in: ids }, deletedAt: null }, { $set: set })
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function bulkDeleteExpenses(ids: string[]) {
  await connectDB()
  await Expense.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date() } })
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}
