'use client'

import { useState, useMemo } from 'react'
import { Search, Trash2, Edit2, Receipt, AlertCircle, CheckSquare, Square, Filter } from 'lucide-react'
import { formatZAR, formatDate, bucketColor } from '@/lib/format'
import { Chip, Button } from '@/components/ui/Forms'
import { deleteExpense, bulkDeleteExpenses } from '@/actions/expenses'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface Expense {
  _id: string
  amountCents: number
  date: string
  vendor?: string
  categoryLabel: string
  bucket: string
  description: string
  paymentMethod: string
  isDeductible: boolean
  receiptUrl?: string
  receiptRequired: boolean
  receiptOverrideReason?: string
  deletedAt?: string
}

interface ExpenseListProps {
  expenses: Expense[]
  monthStatus: 'open' | 'closed'
  onEdit: (expense: Expense) => void
  showDeleted?: boolean
}

export function ExpenseList({ expenses, monthStatus, onEdit, showDeleted = false }: ExpenseListProps) {
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  const filtered = useMemo(() => {
    let list = showDeleted ? expenses : expenses.filter(e => !e.deletedAt)
    if (bucketFilter !== 'all') list = list.filter(e => e.bucket === bucketFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.description.toLowerCase().includes(q) ||
        (e.vendor?.toLowerCase().includes(q)) ||
        e.categoryLabel.toLowerCase().includes(q)
      )
    }
    return list
  }, [expenses, search, bucketFilter, showDeleted])

  const displayed = showAll ? filtered : filtered.slice(0, 20)

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    const res = await deleteExpense(id)
    if (res.success) { success('Expense deleted'); router.refresh() }
    else error(res.error ?? 'Failed')
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} expense(s)?`)) return
    const res = await bulkDeleteExpenses(Array.from(selected))
    if (res.success) { success(`${selected.size} expenses deleted`); setSelected(new Set()); router.refresh() }
    else error('Bulk delete failed')
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleSelectAll() {
    if (selected.size === displayed.length) setSelected(new Set())
    else setSelected(new Set(displayed.map(e => e._id)))
  }

  const pmLabel: Record<string, string> = {
    cash: 'Cash', debit: 'Debit', credit: 'Credit', store_card: 'Store', eft: 'EFT', instant_eft: 'iEFT'
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search expenses…"
              className="w-full bg-raised border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white
                placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Bucket filter */}
          <div className="flex gap-1">
            {['all', 'needs', 'wants', 'savings'].map(b => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize
                  ${bucketFilter === b
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-muted hover:text-white border border-transparent'}`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && monthStatus === 'open' && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              <Trash2 size={12} />
              Delete {selected.size}
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">No expenses match your filters</div>
      ) : (
        <>
          {/* Select all row */}
          {monthStatus === 'open' && (
            <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
              <button onClick={toggleSelectAll} className="text-muted hover:text-white">
                {selected.size === displayed.length && displayed.length > 0
                  ? <CheckSquare size={14} className="text-accent" />
                  : <Square size={14} />}
              </button>
              <span className="text-[10px] text-muted">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="divide-y divide-border/50">
            {displayed.map(e => (
              <ExpenseRow
                key={e._id}
                expense={e}
                selected={selected.has(e._id)}
                onSelect={() => toggleSelect(e._id)}
                onEdit={() => onEdit(e)}
                onDelete={() => handleDelete(e._id)}
                monthStatus={monthStatus}
                pmLabel={pmLabel}
              />
            ))}
          </div>

          {filtered.length > 20 && !showAll && (
            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-accent hover:underline"
              >
                Show all {filtered.length} expenses
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ExpenseRow({
  expense: e, selected, onSelect, onEdit, onDelete, monthStatus, pmLabel
}: {
  expense: Expense
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  monthStatus: 'open' | 'closed'
  pmLabel: Record<string, string>
}) {
  const deleted = !!e.deletedAt
  const needsReceipt = e.receiptRequired && !e.receiptUrl

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-raised/40 transition-colors
      ${deleted ? 'opacity-40' : ''}`}>
      {monthStatus === 'open' && !deleted && (
        <button onClick={onSelect} className="text-muted hover:text-white shrink-0">
          {selected ? <CheckSquare size={14} className="text-accent" /> : <Square size={14} />}
        </button>
      )}

      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm font-medium truncate ${deleted ? 'line-through text-muted' : 'text-white'}`}>
            {e.vendor || e.description}
          </span>
          {e.isDeductible && (
            <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-1 rounded uppercase tracking-wide shrink-0">
              Deductible
            </span>
          )}
          {needsReceipt && (
            <span title="Receipt required but missing">
              <AlertCircle size={12} className="text-gold shrink-0" />
            </span>
          )}
          {e.receiptUrl && (
            <span title="Receipt attached">
              <Receipt size={12} className="text-muted shrink-0" />
            </span>
          )}
        </div>
        <span className={`text-sm font-mono font-semibold shrink-0 ${deleted ? 'line-through text-muted' : 'text-white'}`}>
          {formatZAR(e.amountCents)}
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Chip color={e.bucket}>{e.bucket}</Chip>
          <span className="text-[10px] text-muted">{e.categoryLabel}</span>
          <span className="text-[10px] text-muted">·</span>
          <span className="text-[10px] text-muted">{pmLabel[e.paymentMethod] ?? e.paymentMethod}</span>
        </div>
        <span className="text-[10px] text-muted text-right">{formatDate(e.date)}</span>
      </div>

      {monthStatus === 'open' && !deleted && (
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 text-muted hover:text-white hover:bg-raised rounded-lg transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-muted hover:text-danger hover:bg-raised rounded-lg transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
