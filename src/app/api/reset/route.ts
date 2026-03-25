import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense } from '@/models/Expense'
import { IncomeEntry } from '@/models/IncomeEntry'
import { Month } from '@/models/Month'
import { CardTransaction } from '@/models/CardTransaction'
import { CreditCard } from '@/models/CreditCard'
import { TaxPeriodSnapshot } from '@/models/TaxPeriodSnapshot'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token || token !== process.env.FINANCE_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Delete all transaction data
    await Promise.all([
      Expense.deleteMany({}),
      IncomeEntry.deleteMany({}),
      Month.deleteMany({}),
      CardTransaction.deleteMany({}),
      TaxPeriodSnapshot.deleteMany({}),
    ])

    // Reset card balances to opening balance
    const cards = await CreditCard.find({})
    for (const card of cards) {
      card.currentBalanceCents = card.openingBalanceCents
      await card.save()
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ success: false, error: 'Reset failed' }, { status: 500 })
  }
}
