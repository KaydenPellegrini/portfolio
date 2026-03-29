/* models/Expense.ts */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  bucket: 'Needs' | 'Wants' | 'Savings';
  description: string;
  paymentMethod: 'Cash' | 'Debit' | 'Credit Card' | 'Store Card';
  creditCard?: Types.ObjectId;
  isDeductible: boolean;
  receiptUrl?: string;
  amountCents: number;
  categoryId: string;
  categoryLabel: string;
  
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    bucket: { type: String, enum: ['needs', 'wants', 'savings'], required: true },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'debit', 'credit', 'store_card', 'eft', 'instant_eft'], required: true },
    creditCard: { type: Schema.Types.ObjectId, ref: 'CreditCard' },
    isDeductible: { type: Boolean, default: false },
    receiptUrl: { type: String },
    amountCents:   { type: Number, required: true },
    categoryId:    { type: String, required: true },
    categoryLabel: { type: String, required: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);