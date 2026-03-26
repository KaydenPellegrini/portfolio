/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Receipt, Search, AlertCircle, CheckCircle, Download, ExternalLink } from 'lucide-react'
import { formatZAR, formatDate, bucketColor } from '@/lib/format'
import { Chip } from '@/components/ui/Forms'

interface ReceiptsClientProps { expenses: any[] }

export function ReceiptsClient({ expenses }: ReceiptsClientProps) {
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_receipt' | 'override' | 'none'>('all')
  const [deductibleFilter, setDeductibleFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [selected, setSelected] = useState<any | null>(null)

  const filtered = useMemo(() => {
    let list = expenses
    if (bucketFilter !== 'all') list = list.filter(e => e.bucket === bucketFilter)
    if (deductibleFilter !== 'all') list = list.filter(e => e.isDeductible === (deductibleFilter === 'yes'))
    if (statusFilter !== 'all') {
      if (statusFilter === 'has_receipt') list = list.filter(e => !!e.receiptUrl)
      else if (statusFilter === 'override') list = list.filter(e => e.receiptRequired && !e.receiptUrl && e.receiptOverrideReason)
      else list = list.filter(e => !e.receiptUrl)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.description?.toLowerCase().includes(q) ||
        e.vendor?.toLowerCase().includes(q) ||
        e.categoryLabel?.toLowerCase().includes(q)
      )
    }
    return list
  }, [expenses, bucketFilter, deductibleFilter, statusFilter, search])

  const totalOverrides = expenses.filter(e => e.receiptRequired && !e.receiptUrl).length
  const totalWithReceipt = expenses.filter(e => !!e.receiptUrl).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt size={18} className="text-accent" /> Receipts
          </h1>
          <p className="text-xs text-muted mt-0.5">{totalWithReceipt} receipts · {totalOverrides} overrides</p>
        </div>
      </div>

      {/* Override warning */}
      {totalOverrides > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-sm text-gold">
          <AlertCircle size={15} className="shrink-0" />
          {totalOverrides} expense{totalOverrides > 1 ? 's' : ''} marked as requiring a receipt but missing one.
          These may be challenged in a SARS audit.
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search receipts…"
            className="w-full bg-raised border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-white
              placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterGroup
            label="Bucket"
            options={[
              { value: 'all', label: 'All' },
              { value: 'needs', label: 'Needs' },
              { value: 'wants', label: 'Wants' },
              { value: 'savings', label: 'Savings' },
            ]}
            value={bucketFilter}
            onChange={setBucketFilter}
          />
          <FilterGroup
            label="Receipt"
            options={[
              { value: 'all', label: 'All' },
              { value: 'has_receipt', label: 'Has Receipt' },
              { value: 'override', label: 'Override' },
              { value: 'none', label: 'None' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter as any}
          />
          <FilterGroup
            label="Tax"
            options={[
              { value: 'all', label: 'All' },
              { value: 'yes', label: 'Deductible' },
              { value: 'no', label: 'Non-Deductible' },
            ]}
            value={deductibleFilter}
            onChange={setDeductibleFilter as any}
          />
        </div>
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">No receipts match your filters</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(e => (
            <ReceiptThumbnail key={e._id} expense={e} onClick={() => setSelected(e)} />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <ReceiptDetail expense={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function FilterGroup({
  label, options, value, onChange
}: {
  label: string
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted mr-1">{label}:</span>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
            ${value === o.value ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted border border-transparent hover:text-white'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ReceiptThumbnail({ expense: e, onClick }: { expense: any; onClick: () => void }) {
  const hasReceipt = !!e.receiptUrl
  const hasOverride = e.receiptRequired && !e.receiptUrl

  return (
    <div
      onClick={onClick}
      className={`bg-surface border rounded-xl overflow-hidden cursor-pointer card-hover
        ${hasOverride ? 'border-gold/30' : hasReceipt ? 'border-accent/20' : 'border-border'}`}
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] bg-raised flex items-center justify-center relative">
        {hasReceipt ? (
          e.receiptUrl.match(/\.(jpg|jpeg|png|webp|heic)/i) ? (
            <img src={e.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Receipt size={24} className="text-accent" />
              <span className="text-[10px] text-muted">PDF</span>
            </div>
          )
        ) : hasOverride ? (
          <div className="flex flex-col items-center gap-1">
            <AlertCircle size={24} className="text-gold" />
            <span className="text-[10px] text-gold">Override</span>
          </div>
        ) : (
          <Receipt size={24} className="text-muted/40" />
        )}
        {/* Bucket colour bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5
          ${e.bucket === 'needs' ? 'bg-blue-500' : e.bucket === 'wants' ? 'bg-purple-500' : 'bg-accent'}`} />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs text-white font-medium truncate">{e.vendor || e.description}</p>
        <p className="text-[10px] text-muted">{formatDate(e.date)}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-mono text-white">{formatZAR(e.amountCents)}</span>
          {e.isDeductible && <span className="text-[9px] text-accent">Deductible</span>}
        </div>
      </div>
    </div>
  )
}

function ReceiptDetail({ expense: e, onClose }: { expense: any; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={ev => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">{e.vendor || e.description}</h3>
          <button onClick={onClose} className="text-muted hover:text-white text-lg leading-none">×</button>
        </div>

        {e.receiptUrl && (
          <div className="flex-1 bg-raised overflow-hidden">
            {e.receiptUrl.match(/\.(jpg|jpeg|png|webp)/i)
              ? <img src={e.receiptUrl} alt="Receipt" className="w-full h-full object-contain max-h-[400px]" />
              : <iframe src={e.receiptUrl} className="w-full h-[400px]" title="Receipt" />}
          </div>
        )}

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Amount', value: formatZAR(e.amountCents) },
              { label: 'Date', value: formatDate(e.date) },
              { label: 'Category', value: e.categoryLabel },
              { label: 'Bucket', value: e.bucket },
              { label: 'Payment', value: e.paymentMethod },
              { label: 'Deductible', value: e.isDeductible ? 'Yes' : 'No' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-muted">{s.label}</p>
                <p className="text-white capitalize">{s.value}</p>
              </div>
            ))}
          </div>
          {e.receiptOverrideReason && (
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg">
              <p className="text-xs text-gold font-medium">Override Reason</p>
              <p className="text-xs text-white mt-1">{e.receiptOverrideReason}</p>
            </div>
          )}
          {e.receiptUrl && (
            <a
              href={e.receiptUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-raised border border-border rounded-lg text-xs text-muted hover:text-white transition-colors w-fit"
            >
              <Download size={13} />
              Download Receipt
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
