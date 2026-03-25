import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Expense } from '@/models/Expense'
import { ReceiptsClient } from '@/components/receipts/ReceiptsClient'

interface Props { params: Promise<{ token: string }> }

export default async function ReceiptsPage({ params }: Props) {
  const { token } = await params
  if (!process.env.FINANCE_TOKEN || token !== process.env.FINANCE_TOKEN) notFound()

  await connectDB()
  const expenses = await Expense.find({
    deletedAt: null,
    $or: [
      { receiptUrl: { $exists: true, $ne: '' } },
      { receiptRequired: true },
    ],
  }).sort({ date: -1 }).lean()

  return <ReceiptsClient expenses={JSON.parse(JSON.stringify(expenses))} />
}
