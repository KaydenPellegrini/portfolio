import mongoose, { Schema, Document, Types } from 'mongoose'
import { DEFAULT_BUCKET_ALLOCATION } from '@/lib/constants'

export interface IMonth extends Document {
  _id: Types.ObjectId
  year: number
  month: number          // 1–12
  monthKey: string       // "2025-03"
  status: 'open' | 'closed'
  allocationRules: { needs: number; wants: number; savings: number } // %
  closedAt?: Date
  closeSummary?: {
    grossIncome: number
    spendableNet: number
    taxReserve: number
    totalSpend: number
    byBucket: { needs: number; wants: number; savings: number }
    netPosition: number
  }
  createdAt: Date
}

const MonthSchema = new Schema<IMonth>({
  year:      { type: Number, required: true },
  month:     { type: Number, required: true, min: 1, max: 12 },
  monthKey:  { type: String, required: true, unique: true },
  status:    { type: String, enum: ['open', 'closed'], default: 'open' },
  allocationRules: {
    type: { needs: Number, wants: Number, savings: Number },
    default: DEFAULT_BUCKET_ALLOCATION,
  },
  closedAt:     Date,
  closeSummary: { type: Schema.Types.Mixed },
  createdAt:    { type: Date, default: Date.now },
})

MonthSchema.index({ monthKey: 1 })
MonthSchema.index({ status: 1 })

export const Month = mongoose.models.Month ??
  mongoose.model<IMonth>('Month', MonthSchema)
