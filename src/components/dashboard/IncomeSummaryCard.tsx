'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2, TrendingUp } from 'lucide-react'
import { formatZAR, formatDate } from '@/lib/format'
import { Chip } from '@/components/ui/Forms'
import { deleteIncome } from '@/actions/income'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface IncomeEntry {
  _id: string
  type: string
  amountCents: number
  hoursLogged?: number
  clientRef?: string
  date: string
  description: string
}

interface IncomeSummaryCardProps {
  grossIncomeCents: number
  taxReservePct: number
  taxReserveCents: number
  spendableNetCents: number
  entries: IncomeEntry[]
  monthStatus: 'open' | 'closed'
  onAddIncome: () => void
}

export function IncomeSummaryCard({
  grossIncomeCents,
  taxReservePct,
  taxReserveCents,
  spendableNetCents,
  entries,
  monthStatus,
  onAddIncome,
}: IncomeSummaryCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  async function handleDelete(id: string) {
    const res = await deleteIncome(id)
    if (res.success) { success('Income entry removed'); router.refresh() }
    else error(res.error ?? 'Failed')
  }

  const typeLabel: Record<string, string> = {
    hours_base: 'Hours',
    bonus: 'Bonus',
    other: 'Other',
  }
  const typeColor: Record<string, string> = {
    hours_base: 'needs',
    bonus: 'savings',
    other: 'wants',
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      {/* Top: three income figures */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Gross Billing</p>
          <p className="text-lg font-bold text-white font-mono">{formatZAR(grossIncomeCents)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-accent uppercase tracking-widest mb-1">Spendable Net</p>
          <p className="text-lg font-bold text-accent font-mono">{formatZAR(spendableNetCents)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {monthStatus === 'open' && (
          <button
            onClick={onAddIncome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20
              text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Plus size={13} />
            Add Income
          </button>
        )}
        <button
          onClick={() => setShowBreakdown(e => !e)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-raised border border-border
            text-muted text-xs rounded-lg hover:text-white transition-colors"
        >
          <TrendingUp size={13} />
          {entries.length} entries
          {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          {entries.length === 0 ? (
            <p className="text-xs text-muted italic">No income entries yet</p>
          ) : entries.map(e => (
            <div key={e._id} className="flex items-center gap-3 py-1.5">
              <Chip color={typeColor[e.type]}>{typeLabel[e.type]}</Chip>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{e.description}</p>
                <p className="text-[10px] text-muted">
                  {formatDate(e.date)}
                  {e.hoursLogged ? ` · ${e.hoursLogged}h` : ''}
                  {e.clientRef ? ` · ${e.clientRef}` : ''}
                </p>
              </div>
              <span className="text-xs font-mono text-white shrink-0">{formatZAR(e.amountCents)}</span>
              {monthStatus === 'open' && (
                <button
                  onClick={() => handleDelete(e._id)}
                  className="text-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
