'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react'
import { formatZAR, pct, bucketBarColor } from '@/lib/format'
import { BUCKET_LABELS, type Bucket } from '@/lib/constants'
import { Chip } from '@/components/ui/Forms'

interface BucketCardProps {
  bucket: Bucket
  allocatedCents: number
  spentCents: number
  categoryBreakdown: Array<{ categoryLabel: string; totalCents: number; count: number }>
  monthStatus: 'open' | 'closed'
}

export function BucketCard({ bucket, allocatedCents, spentCents, categoryBreakdown, monthStatus }: BucketCardProps) {
  const [expanded, setExpanded] = useState(false)
  const remainingCents = allocatedCents - spentCents
  const pctUsed = pct(spentCents, allocatedCents)
  const overspent = spentCents > allocatedCents
  const barColor = bucketBarColor(pctUsed)

  const bucketAccent: Record<Bucket, string> = {
    needs:   'border-l-blue-500',
    wants:   'border-l-purple-500',
    savings: 'border-l-accent',
  }

  return (
    <div className={`bg-surface border border-border rounded-2xl overflow-hidden card-hover
      border-l-4 ${bucketAccent[bucket]} ${overspent ? 'border-t border-t-danger/50' : ''}`}>
      {/* Main content */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{BUCKET_LABELS[bucket]}</span>
              {overspent && (
                <span className="text-[10px] font-bold bg-danger/20 text-danger px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Overspent
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">{allocatedCents > 0 ? `${pctUsed}% used` : 'No income yet'}</p>
          </div>
          <button className="text-muted hover:text-white transition-colors p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-raised rounded-full overflow-hidden mb-3">
          <div
            className={`absolute left-0 top-0 h-full rounded-full bucket-bar ${barColor}`}
            style={{ width: `${Math.min(pctUsed, 100)}%` }}
          />
          {overspent && (
            <div className="absolute left-0 top-0 h-full w-full bg-danger/20 rounded-full" />
          )}
        </div>

        {/* Amounts row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-muted">Allocated</p>
            <p className="text-xs font-semibold text-white">{formatZAR(allocatedCents)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Spent</p>
            <p className={`text-xs font-semibold ${overspent ? 'text-danger' : 'text-white'}`}>
              {formatZAR(spentCents)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">{overspent ? 'Over by' : 'Remaining'}</p>
            <p className={`text-xs font-semibold ${overspent ? 'text-danger' : 'text-accent'}`}>
              {formatZAR(Math.abs(remainingCents))}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Category Breakdown</p>
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-muted italic">No expenses yet</p>
          ) : (
            <div className="space-y-2">
              {categoryBreakdown.map(cat => (
                <div key={cat.categoryLabel} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-white truncate">{cat.categoryLabel}</span>
                      <span className="text-xs font-mono text-white ml-2 shrink-0">{formatZAR(cat.totalCents)}</span>
                    </div>
                    <div className="h-1 bg-raised rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${pct(cat.totalCents, allocatedCents)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{cat.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
