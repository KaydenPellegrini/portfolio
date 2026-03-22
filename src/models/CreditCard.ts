/* models/CreditCard.ts */
import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditCard extends Document {
  name: string;
  type: 'general' | 'store';
  store?: string;
  limit: number;
  balance: number;
  minPayment: number;
}

const CreditCardSchema = new Schema<ICreditCard>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['general', 'store'], required: true },
    store: { type: String },
    limit: { type: Number, required: true },
    balance: { type: Number, default: 0 },
    minPayment: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CreditCard = mongoose.models.CreditCard || mongoose.model<ICreditCard>('CreditCard', CreditCardSchema);