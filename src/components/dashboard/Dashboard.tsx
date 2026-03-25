'use client'

import { useState, useMemo } from 'react'
import { Plus, Lock, Unlock, AlertTriangle, RefreshCw, ArrowLeftRight } from 'lucide-react'
import { BucketCard } from '@/components/dashboard/BucketCard'
import { IncomeSummaryCard } from '@/components/dashboard/IncomeSummaryCard'
import { ExpenseList } from '@/components/dashboard/ExpenseList'
import { UpcomingStrip } from '@/components/dashboard/UpcomingStrip'
import { MonthPicker } from '@/components/dashboard/MonthPicker'
import { BucketTransferModal } from '@/components/dashboard/BucketTransferModal'
import { CardsSection } from '@/components/cards/CardsSection'
import { AddExpenseModal } from '@/components/modals/AddExpenseModal'
import { AddIncomeModal } from '@/components/modals/AddIncomeModal'
import { formatZAR, monthKeyToLabel, pct } from '@/lib/format'
import { BUCKETS } from '@/lib/constants'
import { closeMonth } from '@/actions/month'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import type { Bucket } from '@/lib/constants'

interface DashboardProps {
  dashboardData: NonNullable<Awaited<ReturnType<typeof import('@/actions/month').getMonthDashboard>>>
  cardsSummary: Awaited<ReturnType<typeof import('@/actions/cards').getCardsSummary>>
  recurrings: any[]
  months: any[]
  currentMonthKey: string
}

export function Dashboard({ dashboardData, cardsSummary, recurrings, months, currentMonthKey }: DashboardProps) {
  const { month, incomeEntries, expenses, summary } = dashboardData
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [addIncomeOpen, setAddIncomeOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)
  const [closingMonth, setClosingMonth] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const { success, error, warning } = useToast()
  const router = useRouter()

  // Category breakdown per bucket
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<Bucket, Array<{ categoryLabel: string; totalCents: number; count: number }>> = {
      needs: [], wants: [], savings: [],
    }
    const maps: Record<Bucket, Map<string, { totalCents: number; count: number }>> = {
      needs: new Map(), wants: new Map(), savings: new Map(),
    }
    for (const e of expenses) {
      if (e.deletedAt) continue
      const b = e.bucket as Bucket
      const prev = maps[b].get(e.categoryLabel) ?? { totalCents: 0, count: 0 }
      maps[b].set(e.categoryLabel, { totalCents: prev.totalCents + e.amountCents, count: prev.count + 1 })
    }
    for (const b of BUCKETS) {
      breakdown[b] = Array.from(maps[b].entries())
        .map(([categoryLabel, v]) => ({ categoryLabel, ...v }))
        .sort((a, b) => b.totalCents - a.totalCents)
    }
    return breakdown
  }, [expenses])

  // Net position
  const totalSpent = summary.bucketSpend.needs + summary.bucketSpend.wants + summary.bucketSpend.savings
  const netPosition = summary.spendableNetCents - totalSpent
  const isPositive = netPosition >= 0

  // Days left in month
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysLeft = lastDay - today.getDate()

  async function handleCloseMonth() {
    const confirmed = window.confirm(
      `Close ${monthKeyToLabel(month.monthKey)}?\n\nThis will make the month read-only. Make sure all expenses and income are recorded.`
    )
    if (!confirmed) return
    setClosingMonth(true)
    const res = await closeMonth(month.monthKey)
    setClosingMonth(false)
    if (res.success) {
      success('Month closed. A new month has been created.')
      router.refresh()
    } else {
      error(res.error ?? 'Failed to close month')
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* ── Month Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-white">{monthKeyToLabel(month.monthKey)}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {month.status === 'open'
                  ? <><Unlock size={11} className="text-accent" /><span className="text-xs text-accent">Open</span></>
                  : <><Lock size={11} className="text-muted" /><span className="text-xs text-muted">Closed</span></>}
                <span className="text-xs text-muted">·</span>
                <span className="text-xs text-muted">{daysLeft}d left in month</span>
              </div>
            </div>
            <MonthPicker months={months} activeMonthKey={currentMonthKey} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {month.status === 'open' && (
              <>
                <button
                  onClick={() => setTransferOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted text-sm
                    rounded-xl hover:text-white hover:border-accent/40 transition-colors"
                  title="Transfer budget between buckets"
                >
                  <ArrowLeftRight size={13} />
                  Transfer
                </button>
                <button
                  onClick={() => setAddExpenseOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent text-black text-sm font-semibold
                    rounded-xl hover:bg-accent-dim transition-colors"
                >
                  <Plus size={15} />
                  Add Expense
                </button>
                <button
                  onClick={handleCloseMonth}
                  disabled={closingMonth}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted text-sm
                    rounded-xl hover:text-white hover:border-accent/40 transition-colors"
                >
                  {closingMonth
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Lock size={13} />}
                  Close Month
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Alerts strip ── */}
        <AlertsStrip
          bucketSpend={summary.bucketSpend}
          bucketAllocated={summary.bucketAllocated}
          cards={cardsSummary.cards}
          recurrings={recurrings}
        />

        {/* ── Income Summary ── */}
        <IncomeSummaryCard
          grossIncomeCents={summary.grossIncomeCents}
          taxReservePct={summary.taxReservePct}
          taxReserveCents={summary.taxReserveCents}
          spendableNetCents={summary.spendableNetCents}
          entries={incomeEntries}
          monthStatus={month.status}
          onAddIncome={() => setAddIncomeOpen(true)}
        />

        {/* ── Buckets ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUCKETS.map(b => (
            <BucketCard
              key={b}
              bucket={b}
              allocatedCents={summary.bucketAllocated[b]}
              spentCents={summary.bucketSpend[b]}
              categoryBreakdown={categoryBreakdown[b]}
              monthStatus={month.status}
            />
          ))}
        </div>

        {/* ── Upcoming Recurrings ── */}
        {recurrings.length > 0 && <UpcomingStrip recurrings={recurrings} />}

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Expense list — takes 2/3 */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Expenses</h2>
              <span className="text-xs text-muted">{expenses.filter((e: any) => !e.deletedAt).length} this month</span>
            </div>
            <ExpenseList
              expenses={expenses}
              monthStatus={month.status}
              onEdit={(exp) => { setEditExpense(exp); setAddExpenseOpen(true) }}
            />
          </div>

          {/* Sidebar stats — 1/3 */}
          <div className="space-y-4">
            <SidebarStats
              netPosition={netPosition}
              totalSpent={totalSpent}
              spendableNetCents={summary.spendableNetCents}
              daysLeft={daysLeft}
              taxReserveCents={summary.taxReserveCents}
              deductibleTotal={expenses
                .filter((e: any) => !e.deletedAt && e.isDeductible)
                .reduce((s: number, e: any) => s + e.amountCents, 0)}
              receiptOverrides={expenses
                .filter((e: any) => !e.deletedAt && e.receiptRequired && !e.receiptUrl).length}
            />
          </div>
        </div>

        {/* ── Cards Section ── */}
        <CardsSection
          cards={cardsSummary.cards}
          totalBalanceCents={cardsSummary.totalBalanceCents}
          totalLimitCents={cardsSummary.totalLimitCents}
          totalMinPaymentsCents={cardsSummary.totalMinPaymentsCents}
          overallUtilizationPct={cardsSummary.overallUtilizationPct}
          weightedApr={cardsSummary.weightedApr}
        />
      </div>

      {/* Modals */}
      <AddExpenseModal
        open={addExpenseOpen}
        onClose={() => { setAddExpenseOpen(false); setEditExpense(null) }}
        cards={cardsSummary.cards}
        monthStatus={month.status}
        editExpense={editExpense}
      />
      <AddIncomeModal
        open={addIncomeOpen}
        onClose={() => setAddIncomeOpen(false)}
        hourlyRateCents={dashboardData.settings?.hourlyRateCents ?? 11000}
      />
      <BucketTransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        monthKey={month.monthKey}
        bucketAllocated={summary.bucketAllocated}
        bucketSpend={summary.bucketSpend}
      />
    </>
  )
}

// ─── Alerts Strip ─────────────────────────────────────────────────────────────
function AlertsStrip({
  bucketSpend, bucketAllocated, cards, recurrings
}: {
  bucketSpend: Record<string, number>
  bucketAllocated: Record<string, number>
  cards: any[]
  recurrings: any[]
}) {
  const alerts: Array<{ message: string; level: 'danger' | 'warning' }> = []

  // Overspent buckets
  for (const b of BUCKETS) {
    if (bucketSpend[b] > bucketAllocated[b] && bucketAllocated[b] > 0) {
      alerts.push({ message: `${b.charAt(0).toUpperCase() + b.slice(1)} bucket is overspent by ${formatZAR(bucketSpend[b] - bucketAllocated[b])}`, level: 'danger' })
    } else if (bucketAllocated[b] > 0 && pct(bucketSpend[b], bucketAllocated[b]) >= 85) {
      alerts.push({ message: `${b.charAt(0).toUpperCase() + b.slice(1)} bucket at ${pct(bucketSpend[b], bucketAllocated[b])}% — approaching limit`, level: 'warning' })
    }
  }

  // Cards due soon
  const today = new Date().getDate()
  for (const card of cards) {
    const daysLeft = card.statementDueDay - today
    if (daysLeft >= 0 && daysLeft <= 3) {
      alerts.push({ message: `${card.name} payment due in ${daysLeft === 0 ? 'today' : `${daysLeft}d`} — min ${formatZAR(card.minPaymentCents)}`, level: daysLeft === 0 ? 'danger' : 'warning' })
    }
  }

  // Overdue recurrings
  const overdue = recurrings.filter((r: any) => {
    if (!r.nextDueDate) return false
    return new Date(r.nextDueDate) < new Date()
  })
  if (overdue.length > 0) {
    alerts.push({ message: `${overdue.length} overdue recurring expense${overdue.length > 1 ? 's' : ''} need confirmation`, level: 'warning' })
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-1.5">
      {alerts.map((a, i) => (
        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
          ${a.level === 'danger'
            ? 'bg-danger/10 border border-danger/20 text-danger'
            : 'bg-gold/10 border border-gold/20 text-gold'}`}>
          <AlertTriangle size={13} className="shrink-0" />
          {a.message}
        </div>
      ))}
    </div>
  )
}

// ─── Sidebar Stats ─────────────────────────────────────────────────────────────
function SidebarStats({
  netPosition, totalSpent, spendableNetCents, daysLeft,
  taxReserveCents, deductibleTotal, receiptOverrides
}: {
  netPosition: number
  totalSpent: number
  spendableNetCents: number
  daysLeft: number
  taxReserveCents: number
  deductibleTotal: number
  receiptOverrides: number
}) {
  const isPositive = netPosition >= 0
  const spendRate = spendableNetCents > 0 ? pct(totalSpent, spendableNetCents) : 0
  const dailyBudget = daysLeft > 0 && isPositive ? Math.floor(netPosition / daysLeft) : 0

  const stats = [
    {
      label: 'Net Position',
      value: formatZAR(Math.abs(netPosition)),
      subLabel: isPositive ? 'surplus' : 'deficit',
      color: isPositive ? 'text-accent' : 'text-danger',
    },
    {
      label: 'Daily Budget Left',
      value: dailyBudget > 0 ? formatZAR(dailyBudget) : '—',
      subLabel: `${daysLeft}d remaining`,
      color: dailyBudget > 0 ? 'text-white' : 'text-muted',
    },
    {
      label: 'Budget Used',
      value: `${spendRate}%`,
      subLabel: `${formatZAR(totalSpent)} of ${formatZAR(spendableNetCents)}`,
      color: spendRate > 100 ? 'text-danger' : spendRate > 85 ? 'text-gold' : 'text-white',
    },
    {
      label: 'Tax Reserve (MTD)',
      value: formatZAR(taxReserveCents),
      subLabel: 'ring-fenced, not spendable',
      color: 'text-gold',
    },
    {
      label: 'Deductible Expenses (MTD)',
      value: formatZAR(deductibleTotal),
      subLabel: 'counts toward IRP6',
      color: 'text-accent',
    },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
      <p className="text-[10px] text-muted uppercase tracking-widest">Month at a Glance</p>
      {stats.map(s => (
        <div key={s.label}>
          <p className="text-[10px] text-muted">{s.label}</p>
          <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-muted">{s.subLabel}</p>
        </div>
      ))}
      {receiptOverrides > 0 && (
        <div className="mt-2 p-2.5 bg-gold/10 border border-gold/20 rounded-lg">
          <p className="text-xs text-gold font-medium">
            ⚠ {receiptOverrides} receipt override{receiptOverrides > 1 ? 's' : ''} this month
          </p>
          <p className="text-[10px] text-muted mt-0.5">Review before month close</p>
        </div>
      )}
    </div>
  )
}
