/* models/Expense.ts */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  date: Date;
  category: string;
  bucket: 'Needs' | 'Wants' | 'Savings';
  description: string;
  paymentMethod: 'Cash' | 'Debit' | 'Credit Card' | 'Store Card';
  creditCard?: Types.ObjectId;
  isDeductible: boolean;
  receiptUrl?: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    bucket: { type: String, enum: ['needs', 'wants', 'savings'], required: true },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'debit', 'credit', 'store_card', 'eft', 'instant_eft'], required: true },
    creditCard: { type: Schema.Types.ObjectId, ref: 'CreditCard' },
    isDeductible: { type: Boolean, default: false },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);