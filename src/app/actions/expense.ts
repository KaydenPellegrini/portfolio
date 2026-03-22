/* app/actions/expense.ts */
'use server';

import { connectDB } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function addExpenseAction(formData: FormData) {
  await connectDB();

  const amountStr = formData.get('amount') as string;
  const dateStr = formData.get('date') as string;
  const category = formData.get('category') as string;
  const bucket = formData.get('bucket') as string;
  const description = formData.get('description') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const creditCardId = formData.get('creditCardId') as string || undefined;
  const isDeductibleStr = formData.get('isDeductible') as string;
  const receiptFile = formData.get('receipt') as File | null;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' };

  if (!category || !bucket || !description) return { error: 'Missing required fields' };

  const isDeductible = isDeductibleStr === 'true';
  if (isDeductible && (!receiptFile || receiptFile.size === 0)) {
    return { error: 'Receipt is required for deductible expenses' };
  }

  let receiptUrl: string | undefined;
  if (receiptFile && receiptFile.size > 0) {
    const { url } = await put(`receipts/${uuidv4()}-${receiptFile.name}`, receiptFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    receiptUrl = url;
  }

  try {
    await Expense.create({
      amount,
      date: new Date(dateStr),
      category,
      bucket,
      description,
      paymentMethod,
      creditCard: creditCardId || undefined,
      isDeductible,
      receiptUrl,
    });

    revalidatePath('/iNrGGzphxIhJ95fCmJBmZzzXb7iXDU');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to save expense' };
  }
}