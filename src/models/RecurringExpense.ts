/* models/RecurringExpense.ts */
import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringExpense extends Document {
  amount: number;
  category: string;
  bucket: 'Needs' | 'Wants' | 'Savings';
  description: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDue: Date;
  isActive: boolean;
}

const RecurringSchema = new Schema<IRecurringExpense>(
  {
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    bucket: { type: String, enum: ['Needs', 'Wants', 'Savings'], required: true },
    description: { type: String, required: true },
    frequency: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
    nextDue: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RecurringExpense = mongoose.models.RecurringExpense || mongoose.model<IRecurringExpense>('RecurringExpense', RecurringSchema);