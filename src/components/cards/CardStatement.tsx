'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { formatZAR, formatDate } from '@/lib/format'
import { getCardTransactions } from '@/actions/cards'
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp } from 'lucide-react'

interface Card {
  _id: string
  name: string
  last4?: string
  currentBalanceCents: number
  limitCents: number
  apr: number
}

interface CardStatementProps {
  open: boolean
  onClose: () => void
  card: Card
}

interface Transaction {
  _id: string
  type: 'charge' | 'payment' | 'adjustment' | 'refund'
  amountCents: number
  date: string
  description: string
  runningBalanceCents?: number
}

export function CardStatement({ open, onClose, card }: CardStatementProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getCardTransactions(card._id, 100).then(txns => {
      setTransactions(txns)
      setLoading(false)
    })
  }, [open, card._id])

  const typeConfig = {
    charge:     { label: 'Charge',     icon: ArrowUpRight,   color: 'text-danger',   sign: '+' },
    payment:    { label: 'Payment',    icon: ArrowDownRight, color: 'text-accent',   sign: '-' },
    adjustment: { label: 'Adjustment', icon: RefreshCw,      color: 'text-gold',     sign: '±' },
    refund:     { label: 'Refund',     icon: TrendingUp,     color: 'text-accent',   sign: '-' },
  }

  const totalCharges = transactions.filter(t => t.type === 'charge').reduce((s, t) => s + t.amountCents, 0)
  const totalPayments = transactions.filter(t => t.type === 'payment' || t.type === 'refund').reduce((s, t) => s + t.amountCents, 0)

  return (
    <Modal open={open} onClose={onClose} title={`Statement — ${card.name}${card.last4 ? ` ••••${card.last4}` : ''}`} size="lg">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-raised rounded-xl text-center">
          <p className="text-[10px] text-muted">Current Balance</p>
          <p className="text-base font-bold font-mono text-danger">{formatZAR(card.currentBalanceCents)}</p>
        </div>
        <div className="p-3 bg-raised rounded-xl text-center">
          <p className="text-[10px] text-muted">Total Charged</p>
          <p className="text-base font-bold font-mono text-white">{formatZAR(totalCharges)}</p>
        </div>
        <div className="p-3 bg-raised rounded-xl text-center">
          <p className="text-[10px] text-muted">Total Paid</p>
          <p className="text-base font-bold font-mono text-accent">{formatZAR(totalPayments)}</p>
        </div>
      </div>

      {/* Transaction list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <span className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center text-muted text-sm">No transactions yet</div>
      ) : (
        <div className="space-y-1">
          {transactions.map(t => {
            const cfg = typeConfig[t.type]
            const Icon = cfg.icon
            return (
              <div key={t._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raised transition-colors">
                <div className={`p-1.5 rounded-lg bg-raised ${cfg.color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{t.description}</p>
                  <p className="text-[10px] text-muted">{formatDate(t.date)} · {cfg.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-mono font-semibold ${cfg.color}`}>
                    {cfg.sign}{formatZAR(t.amountCents)}
                  </p>
                  {t.runningBalanceCents !== undefined && (
                    <p className="text-[10px] text-muted font-mono">bal {formatZAR(t.runningBalanceCents)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
