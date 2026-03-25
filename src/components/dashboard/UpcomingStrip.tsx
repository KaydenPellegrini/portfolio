'use client'

import { useState } from 'react'
import { Clock, Check, AlertTriangle } from 'lucide-react'
import { formatZAR, formatDateShort } from '@/lib/format'
import { confirmRecurring } from '@/actions/month'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface Recurring {
  _id: string
  name: string
  amountCents: number
  nextDueDate?: string
  dueDay: number
  bucket: string
  categoryLabel: string
}

export function UpcomingStrip({ recurrings }: { recurrings: Recurring[] }) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const { success, error } = useToast()
  const router = useRouter()

  if (recurrings.length === 0) return null

  const today = new Date()

  async function handleConfirm(id: string) {
    setConfirming(id)
    const res = await confirmRecurring(id)
    setConfirming(null)
    if (res.success) {
      success('Recurring expense confirmed')
      router.refresh()
    } else {
      error(res.error ?? 'Failed')
    }
  }

  function getStatus(rec: Recurring) {
    if (!rec.nextDueDate) return 'upcoming'
    const due = new Date(rec.nextDueDate)
    const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'overdue'
    if (diff === 0) return 'today'
    return 'upcoming'
  }

  const statusStyles = {
    overdue:  'border-danger/40 bg-danger/5',
    today:    'border-gold/40 bg-gold/5',
    upcoming: 'border-border bg-raised/40',
  }
  const statusIcon = {
    overdue:  <AlertTriangle size={11} className="text-danger" />,
    today:    <Clock size={11} className="text-gold" />,
    upcoming: <Clock size={11} className="text-muted" />,
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Upcoming (14 days)</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {recurrings.map(rec => {
          const status = getStatus(rec)
          return (
            <div
              key={rec._id}
              className={`shrink-0 rounded-xl border px-3 py-2.5 min-w-[140px] ${statusStyles[status]}`}
            >
              <div className="flex items-center gap-1 mb-1">
                {statusIcon[status]}
                <span className="text-[10px] text-muted capitalize">{status}</span>
              </div>
              <p className="text-xs font-semibold text-white mb-0.5 truncate">{rec.name}</p>
              <p className="text-xs font-mono text-white mb-2">{formatZAR(rec.amountCents)}</p>
              <button
                onClick={() => handleConfirm(rec._id)}
                disabled={confirming === rec._id}
                className={`w-full py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1
                  ${status === 'overdue'
                    ? 'bg-danger/20 text-danger hover:bg-danger/30'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
              >
                {confirming === rec._id
                  ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  : <><Check size={11} /> Confirm</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
