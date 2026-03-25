import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICardTransaction extends Document {
  _id: Types.ObjectId
  cardId: Types.ObjectId
  expenseId?: Types.ObjectId   // set when transaction is from an expense charge
  type: 'charge' | 'payment' | 'adjustment' | 'refund'
  amountCents: number          // always positive; type determines direction
  date: Date
  description: string
  runningBalanceCents?: number // snapshot after this transaction
  createdAt: Date
}

const CardTransactionSchema = new Schema<ICardTransaction>({
  cardId:              { type: Schema.Types.ObjectId, ref: 'CreditCard', required: true, index: true },
  expenseId:           { type: Schema.Types.ObjectId, ref: 'Expense' },
  type:                { type: String, enum: ['charge', 'payment', 'adjustment', 'refund'], required: true },
  amountCents:         { type: Number, required: true },
  date:                { type: Date, required: true },
  description:         { type: String, required: true },
  runningBalanceCents: Number,
  createdAt:           { type: Date, default: Date.now },
})

CardTransactionSchema.index({ cardId: 1, date: -1 })

export const CardTransaction = mongoose.models.CardTransaction ??
  mongoose.model<ICardTransaction>('CardTransaction', CardTransactionSchema)
