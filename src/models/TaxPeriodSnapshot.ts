import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITaxPeriodSnapshot extends Document {
  _id: Types.ObjectId
  taxYear: string
  period: '1st' | '2nd' | 'topup' | 'ytd'
  grossIncomeCents: number
  totalDeductionsCents: number
  estimatedTaxableIncomeCents: number
  estimatedTaxCents: number
  taxReserveAccumulatedCents: number
  deductibleExpenseCount: number
  receiptOverrideCount: number
  snapshotLabel?: string
  calculatedAt: Date
  createdAt: Date
}

const TaxPeriodSnapshotSchema = new Schema<ITaxPeriodSnapshot>({
  taxYear:                        { type: String, required: true, index: true },
  period:                         { type: String, enum: ['1st', '2nd', 'topup', 'ytd'], required: true },
  grossIncomeCents:               { type: Number, required: true },
  totalDeductionsCents:           { type: Number, required: true },
  estimatedTaxableIncomeCents:    { type: Number, required: true },
  estimatedTaxCents:              { type: Number, required: true },
  taxReserveAccumulatedCents:     { type: Number, required: true },
  deductibleExpenseCount:         { type: Number, default: 0 },
  receiptOverrideCount:           { type: Number, default: 0 },
  snapshotLabel:                  String,
  calculatedAt:                   { type: Date, required: true },
  createdAt:                      { type: Date, default: Date.now },
})

export const TaxPeriodSnapshot = mongoose.models.TaxPeriodSnapshot ??
  mongoose.model<ITaxPeriodSnapshot>('TaxPeriodSnapshot', TaxPeriodSnapshotSchema)
