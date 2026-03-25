'use server'

import { connectDB } from '@/lib/db'
import { IncomeEntry } from '@/models/IncomeEntry'
import { Month } from '@/models/Month'
import { Settings } from '@/models/Settings'
import { ensureCurrentMonth } from './month'
import { currentMonthKey, taxYearForDate } from '@/lib/format'
import { parseToCents } from '@/lib/format'
import { revalidatePath } from 'next/cache'

const TOKEN = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

export interface AddIncomeInput {
  type: 'hours_base' | 'bonus' | 'other'
  amountStr: string           // decimal string e.g. "1234.56"
  hoursLogged?: number
  clientRef?: string
  date: string
  description: string
  monthKey?: string
}

export async function addIncome(input: AddIncomeInput) {
  await connectDB()
  const monthKey = input.monthKey ?? currentMonthKey()
  await ensureCurrentMonth()
  const month = await Month.findOne({ monthKey })
  if (!month) return { success: false, error: 'Month not found' }
  if (month.status === 'closed') return { success: false, error: 'Month is closed' }

  const settings = await Settings.findOne().lean()
  const hourlyRateCents = settings?.hourlyRateCents ?? 11000

  let amountCents = parseToCents(input.amountStr)
  if (input.type === 'hours_base' && input.hoursLogged && amountCents === 0) {
    amountCents = Math.round(input.hoursLogged * hourlyRateCents)
  }

  if (amountCents <= 0) return { success: false, error: 'Amount must be positive' }

  const taxYear = taxYearForDate(new Date(input.date))

  await IncomeEntry.create({
    monthId: month._id,
    monthKey,
    type: input.type,
    amountCents,
    hoursLogged: input.hoursLogged,
    hourlyRateCents: input.type === 'hours_base' ? hourlyRateCents : undefined,
    clientRef: input.clientRef,
    date: new Date(input.date),
    description: input.description,
    taxYear,
  })

  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function deleteIncome(id: string) {
  await connectDB()
  const entry = await IncomeEntry.findById(id)
  if (!entry) return { success: false, error: 'Not found' }
  const month = await Month.findById(entry.monthId)
  if (month?.status === 'closed') return { success: false, error: 'Month is closed' }
  await IncomeEntry.findByIdAndDelete(id)
  revalidatePath(`/${TOKEN}`)
  return { success: true }
}

export async function getIncomeForMonth(monthKey: string) {
  await connectDB()
  const entries = await IncomeEntry.find({ monthKey }).sort({ date: -1 }).lean()
  return JSON.parse(JSON.stringify(entries))
}
