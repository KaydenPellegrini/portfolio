'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { monthKeyToLabel, currentMonthKey } from '@/lib/format'
import { useState } from 'react'

interface MonthPickerProps {
  months: Array<{ monthKey: string; status: string }>
  activeMonthKey: string
}

export function MonthPicker({ months, activeMonthKey }: MonthPickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const sortedMonths = [...months].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  const currentIdx = sortedMonths.findIndex(m => m.monthKey === activeMonthKey)

  function navigate(monthKey: string) {
    const params = new URLSearchParams()
    if (monthKey !== currentMonthKey()) {
      params.set('month', monthKey)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    setOpen(false)
  }

  function prev() {
    if (currentIdx < sortedMonths.length - 1) {
      navigate(sortedMonths[currentIdx + 1].monthKey)
    }
  }

  function next() {
    if (currentIdx > 0) {
      navigate(sortedMonths[currentIdx - 1].monthKey)
    }
  }

  const hasPrev = currentIdx < sortedMonths.length - 1
  const hasNext = currentIdx > 0
  const isCurrentMonth = activeMonthKey === currentMonthKey()

  return (
    <div className="flex items-center gap-1 relative">
      <button
        onClick={prev}
        disabled={!hasPrev}
        className="p-1.5 text-muted hover:text-white disabled:opacity-30 hover:bg-raised rounded-lg transition-colors"
        title="Previous month"
      >
        <ChevronLeft size={14} />
      </button>

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-raised border border-border
          rounded-lg text-xs text-white hover:border-accent/40 transition-colors"
      >
        <Calendar size={12} className="text-muted" />
        {monthKeyToLabel(activeMonthKey)}
        {!isCurrentMonth && (
          <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">Historical</span>
        )}
      </button>

      <button
        onClick={next}
        disabled={!hasNext}
        className="p-1.5 text-muted hover:text-white disabled:opacity-30 hover:bg-raised rounded-lg transition-colors"
        title="Next month"
      >
        <ChevronRight size={14} />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => navigate(currentMonthKey())}
          className="px-2 py-1 text-[10px] text-accent hover:underline"
        >
          Back to current
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border
            rounded-xl shadow-2xl min-w-[180px] max-h-64 overflow-y-auto py-1">
            {sortedMonths.map(m => (
              <button
                key={m.monthKey}
                onClick={() => navigate(m.monthKey)}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between
                  hover:bg-raised transition-colors
                  ${m.monthKey === activeMonthKey ? 'text-accent' : 'text-white'}`}
              >
                <span>{monthKeyToLabel(m.monthKey)}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full
                  ${m.status === 'open'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-raised text-muted border border-border'}`}>
                  {m.status}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
