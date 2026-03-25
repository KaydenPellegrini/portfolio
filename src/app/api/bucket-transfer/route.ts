import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense } from '@/models/Expense'
import { Month } from '@/models/Month'
import { taxYearForDate } from '@/lib/format'
import type { Bucket } from '@/lib/constants'
import { BUCKET_LABELS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { monthKey, fromBucket, toBucket, amountCents, reason } = await request.json()

    if (!monthKey || !fromBucket || !toBucket || !amountCents || !reason) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const month = await Month.findOne({ monthKey })
    if (!month) return NextResponse.json({ success: false, error: 'Month not found' }, { status: 404 })
    if ((month as any).status === 'closed') {
      return NextResponse.json({ success: false, error: 'Month is closed' }, { status: 400 })
    }

    const taxYear = taxYearForDate(new Date())
    const now = new Date()

    // Create two transfer expenses — one debit from source, one credit to dest
    // We use a negative amount in the "from" bucket to reduce its spend,
    // and a positive amount in the "to" bucket to increase its allocation
    // The canonical approach: create a paired transfer record in both buckets
    // tagged with categoryId = 'bucket_transfer' so it's identifiable

    await Expense.create([
      {
        monthId: month._id,
        monthKey,
        taxYear,
        amountCents: -amountCents,  // negative = reduces spend in source bucket
        date: now,
        vendor: 'Budget Transfer',
        categoryId: 'bucket_transfer',
        categoryLabel: `Transfer → ${BUCKET_LABELS[toBucket as Bucket]}`,
        bucket: fromBucket,
        description: `Budget transfer to ${BUCKET_LABELS[toBucket as Bucket]}: ${reason}`,
        paymentMethod: 'eft',
        isDeductible: false,
        receiptRequired: false,
        isForeignCurrency: false,
      },
      {
        monthId: month._id,
        monthKey,
        taxYear,
        amountCents,
        date: now,
        vendor: 'Budget Transfer',
        categoryId: 'bucket_transfer',
        categoryLabel: `Transfer ← ${BUCKET_LABELS[fromBucket as Bucket]}`,
        bucket: toBucket,
        description: `Budget transfer from ${BUCKET_LABELS[fromBucket as Bucket]}: ${reason}`,
        paymentMethod: 'eft',
        isDeductible: false,
        receiptRequired: false,
        isForeignCurrency: false,
      }
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Transfer error:', err)
    return NextResponse.json({ success: false, error: 'Transfer failed' }, { status: 500 })
  }
}
