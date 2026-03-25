import mongoose, { Schema, Document, Types } from 'mongoose'
import type { IncomeType } from '@/lib/constants'

export interface IIncomeEntry extends Document {
  _id: Types.ObjectId
  monthId: Types.ObjectId
  monthKey: string
  type: IncomeType
  amountCents: number
  hoursLogged?: number      // for hours_base type
  hourlyRateCents?: number  // rate at time of entry
  clientRef?: string
  date: Date
  description: string
  taxYear: string           // e.g. "2025/26"
  createdAt: Date
}

const IncomeEntrySchema = new Schema<IIncomeEntry>({
  monthId:         { type: Schema.Types.ObjectId, ref: 'Month', required: true, index: true },
  monthKey:        { type: String, required: true, index: true },
  type:            { type: String, enum: ['hours_base', 'bonus', 'other'], required: true },
  amountCents:     { type: Number, required: true },
  hoursLogged:     Number,
  hourlyRateCents: Number,
  clientRef:       String,
  date:            { type: Date, required: true },
  description:     { type: String, required: true },
  taxYear:         { type: String, required: true, index: true },
  createdAt:       { type: Date, default: Date.now },
})

export const IncomeEntry = mongoose.models.IncomeEntry ??
  mongoose.model<IIncomeEntry>('IncomeEntry', IncomeEntrySchema)
