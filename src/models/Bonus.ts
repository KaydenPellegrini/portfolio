/* models/Bonus.ts */
import mongoose, { Schema, Document } from 'mongoose';

export interface IBonus extends Document {
  amount: number;
  date: Date;
  description: string;
}

const BonusSchema = new Schema<IBonus>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Bonus = mongoose.models.Bonus || mongoose.model<IBonus>('Bonus', BonusSchema);