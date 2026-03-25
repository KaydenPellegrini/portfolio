'use server'

import { connectDB } from '@/lib/db'
import { CreditCard } from '@/models/CreditCard'
import { CardTransaction } from '@/models/CardTransaction'
import { parseToCents } from '@/lib/format'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

export async function getCards(activeOnly = true) {
  await connectDB()
  const filter = activeOnly ? { isActive: true } : {}
  const cards = await CreditCard.find(filter).sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(cards))
}

export async function addCard(input: {
  name: string
  type: string
  retailer?: string
  last4?: string
  limitStr: string
  openingBalanceStr: string
  minPaymentStr?: string
  statementDueDay: number
  apr: number
  rewards?: string
}) {
  await connectDB()
  const limitCents = parseToCents(input.limitStr)
  const openingBalanceCents = parseToCents(input.openingBalanceStr)
  const minPaymentCents = input.minPaymentStr ? parseToCents(input.minPaymentStr) : 0

  const card = await CreditCard.create({
    name: input.name,
    type: input.type,
    retailer: input.retailer,
    last4: input.last4,
    limitCents,
    openingBalanceCents,
    currentBalanceCents: openingBalanceCents,
    minPaymentCents,
    statementDueDay: input.statementDueDay,
    apr: input.apr,
    rewards: input.rewards,
    isActive: true,
  })

  revalidatePath(`/${TOKEN}`)
  return { success: true, cardId: card._id.toString() }
}

export async function updateCard(id: string, input: {
  name?: string
  limitStr?: string
  minPaymentStr?: string
  statementDueDay?: number
  apr?: number
  rewards?: string
  isActive?: boolean
}) {
  await connectDB()
  const set: Record<string, unknown> = {}
  if (input.name) set.name = input.name
  if (input.limitStr) set.limitCents = parseToCents(input.limitStr)
  if (input.minPaymentStr) set.minPaymentCents = parseToCents(input.minPaymentStr)
  if (input.statementDueDay) set.statementDueDay = input.statementDueDay
  if (input.apr !== undefined) set.apr = input.apr
  if (input.rewards !== undefined) set.rewards = input.rewards
  if (input.isActive !== undefined) set.isActive = input.isActive

  await CreditCard.findByIdAndUpdate(id, { $set: set })
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function recordCardPayment(input: {
  cardId: string
  amountStr: string
  date: string
  description?: string
}) {
  await connectDB()
  const amountCents = parseToCents(input.amountStr)
  if (amountCents <= 0) return { success: false, error: 'Amount must be positive' }

  const card = await CreditCard.findById(input.cardId)
  if (!card) return { success: false, error: 'Card not found' }

  card.currentBalanceCents = Math.max(0, card.currentBalanceCents - amountCents)
  await card.save()

  await CardTransaction.create({
    cardId: input.cardId,
    type: 'payment',
    amountCents,
    date: new Date(input.date),
    description: input.description ?? `Payment — ${card.name}`,
    runningBalanceCents: card.currentBalanceCents,
  })

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function recordCardAdjustment(input: {
  cardId: string
  amountStr: string
  isCredit: boolean
  date: string
  description: string
}) {
  await connectDB()
  const amountCents = parseToCents(input.amountStr)
  const card = await CreditCard.findById(input.cardId)
  if (!card) return { success: false, error: 'Card not found' }

  if (input.isCredit) {
    card.currentBalanceCents = Math.max(0, card.currentBalanceCents - amountCents)
  } else {
    card.currentBalanceCents += amountCents
  }
  await card.save()

  await CardTransaction.create({
    cardId: input.cardId,
    type: 'adjustment',
    amountCents,
    date: new Date(input.date),
    description: input.description,
    runningBalanceCents: card.currentBalanceCents,
  })

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function getCardTransactions(cardId: string, limit = 50) {
  await connectDB()
  const txns = await CardTransaction.find({ cardId }).sort({ date: -1 }).limit(limit).lean()
  return JSON.parse(JSON.stringify(txns))
}

export async function getCardsSummary() {
  await connectDB()
  const cards = await CreditCard.find({ isActive: true }).lean()
  const totalBalance = cards.reduce((s, c) => s + c.currentBalanceCents, 0)
  const totalLimit = cards.reduce((s, c) => s + c.limitCents, 0)
  const totalMinPayments = cards.reduce((s, c) => s + c.minPaymentCents, 0)
  const weightedAprNumerator = cards.reduce((s, c) => s + c.apr * c.currentBalanceCents, 0)
  const weightedApr = totalBalance > 0 ? weightedAprNumerator / totalBalance : 0

  return {
    cards: JSON.parse(JSON.stringify(cards)),
    totalBalanceCents: totalBalance,
    totalLimitCents: totalLimit,
    totalMinPaymentsCents: totalMinPayments,
    overallUtilizationPct: totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0,
    weightedApr: Math.round(weightedApr * 100) / 100,
  }
}
