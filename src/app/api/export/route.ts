import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense } from '@/models/Expense'
import { IncomeEntry } from '@/models/IncomeEntry'
import { Month } from '@/models/Month'
import { CreditCard } from '@/models/CreditCard'
import { CardTransaction } from '@/models/CardTransaction'
import { RecurringExpense } from '@/models/RecurringExpense'
import { Settings } from '@/models/Settings'
import { TaxPeriodSnapshot } from '@/models/TaxPeriodSnapshot'

export async function GET(request: NextRequest) {
  // Simple token check via query param
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token !== process.env.FINANCE_TOKEN) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  await connectDB()

  const [
    expenses, incomeEntries, months, cards,
    cardTransactions, recurrings, settings, snapshots,
  ] = await Promise.all([
    Expense.find().lean(),
    IncomeEntry.find().lean(),
    Month.find().lean(),
    CreditCard.find().lean(),
    CardTransaction.find().lean(),
    RecurringExpense.find().lean(),
    Settings.findOne().lean(),
    TaxPeriodSnapshot.find().lean(),
  ])

  const backup = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    data: {
      expenses,
      incomeEntries,
      months,
      cards,
      cardTransactions,
      recurrings,
      settings,
      snapshots,
    },
    counts: {
      expenses: expenses.length,
      incomeEntries: incomeEntries.length,
      months: months.length,
      cards: cards.length,
      cardTransactions: cardTransactions.length,
      recurrings: recurrings.length,
      snapshots: snapshots.length,
    },
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="finance-os-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
