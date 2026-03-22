/* app/actions/bonus.ts */
'use server';

import { connectDB } from '@/lib/db';
import { Bonus } from '@/models/Bonus';
import { revalidatePath } from 'next/cache';

export async function addBonusAction(formData: FormData) {
  await connectDB();

  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number' };
  }

  if (!description.trim()) {
    return { error: 'Description required' };
  }

  try {
    await Bonus.create({
      amount,
      description,
      date: new Date(),
    });

    revalidatePath('/iNrGGzphxIhJ95fCmJBmZzzXb7iXDU'); // your hidden route
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to save bonus — check logs' };
  }
}