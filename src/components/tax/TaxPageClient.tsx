/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { FileText, Download, Camera, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { formatZAR, formatDate } from '@/lib/format'
import { Button, Card } from '@/components/ui/Forms'
import { saveTaxSnapshot } from '@/actions/tax'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface TaxPageClientProps {
  data: any
  taxYear: string
}

export function TaxPageClient({ data, taxYear }: TaxPageClientProps) {
  const [activeTab, setActiveTab] = useState<'ytd' | '1st' | '2nd'>('ytd')
  const [savingSnapshot, setSavingSnapshot] = useState(false)
  const [snapshotLabel, setSnapshotLabel] = useState('')
  const { success, error } = useToast()
  const router = useRouter()

  const {
    grossIncomeCents,
    totalDeductionsCents,
    estimatedTaxableIncomeCents,
    taxCalc,
    annualisedTaxableIncomeCents,
    annualisedTaxCalc,
    taxReserveAccumulatedCents,
    taxReservePct,
    receiptOverrideCount,
    deductibleExpenses,
    allExpenses,
    snapshots,
    periods,
    period1Summary,
  } = data

  const over = taxReserveAccumulatedCents - taxCalc.netTax
  const isOverReserving = over > 0

  // Deadlines
  const now = new Date()
  const urgentPeriods = (periods ?? []).filter((p: any) => {
    const deadline = new Date(p.deadline)
    const diffDays = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 60
  })

  async function handleSaveSnapshot() {
    setSavingSnapshot(true)
    const res = await saveTaxSnapshot({ taxYear, period: activeTab as any, label: snapshotLabel || undefined })
    setSavingSnapshot(false)
    if (res.success) { success('Snapshot saved'); router.refresh() }
    else error(res.error ?? 'Failed')
  }

  function handleExportCSV() {
    const rows = [
      ['Date', 'Vendor', 'Description', 'Category', 'Amount (ZAR)', 'Deductible', 'Receipt'],
      ...deductibleExpenses.map((e: any) => [
        formatDate(e.date),
        e.vendor ?? '',
        e.description,
        e.categoryLabel,
        (e.amountCents / 100).toFixed(2),
        'YES',
        e.receiptUrl ?? (e.receiptOverrideReason ? `Override: ${e.receiptOverrideReason}` : 'No'),
      ])
    ]
    const csv = rows.map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IRP6-${taxYear.replace('/', '_')}-deductibles.csv`
    a.click()
    URL.revokeObjectURL(url)
    success('CSV exported')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            Provisional Tax
          </h1>
          <p className="text-xs text-muted mt-0.5">Tax Year {taxYear} · 1 March – 28 Feb</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/tax-report?token=${process.env.NEXT_PUBLIC_FINANCE_TOKEN}&year=${taxYear}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-raised border border-border text-muted
              text-xs rounded-lg hover:text-white hover:border-accent/40 transition-colors"
          >
            <FileText size={13} />
            PDF Report
          </a>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={13} />
            IRP6 CSV
          </Button>
        </div>
      </div>

      {/* Deadline banners */}
      {urgentPeriods.map((p: any) => {
        const deadline = new Date(p.deadline)
        const daysLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div key={p.period} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
            ${daysLeft <= 14 ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-gold/10 border-gold/30 text-gold'}`}>
            <Clock size={15} className="shrink-0" />
            <span>
              <strong>{p.label}</strong> deadline: {formatDate(deadline)} ({daysLeft}d)
              · {p.coverageLabel}
            </span>
          </div>
        )
      })}

      {/* Main tax summary card */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex gap-2">
            {['ytd', '1st', '2nd'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${activeTab === tab ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-white border border-transparent'}`}
              >
                {tab === 'ytd' ? 'YTD' : tab === '1st' ? 'Period 1 (Mar–Aug)' : 'Period 2 (Full Year)'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: tax calculation */}
          <div className="space-y-3">
            <p className="text-[10px] text-muted uppercase tracking-widest">Tax Calculation</p>
            <TaxLine label="Gross Billing Income" value={grossIncomeCents} />
            <TaxLine label="Less: Deductible Expenses" value={-totalDeductionsCents} accent="text-accent" />
            <div className="border-t border-border pt-2">
              <TaxLine label="Estimated Taxable Income" value={estimatedTaxableIncomeCents} bold />
            </div>
            <div className="border-t border-border pt-2 space-y-1.5">
              <TaxLine label="Gross Tax (before rebates)" value={taxCalc.grossTax} />
              <TaxLine label="Less: Primary Rebate" value={-taxCalc.rebateAmount} accent="text-accent" />
              <TaxLine label="Net Tax Payable" value={taxCalc.netTax} bold accent="text-danger" />
            </div>
            <div className="p-3 bg-raised rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Effective Rate</span>
                <span className="text-white font-mono">{taxCalc.effectiveRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Marginal Rate</span>
                <span className="text-white font-mono">{taxCalc.marginalRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Annualised Taxable Income</span>
                <span className="text-white font-mono">{formatZAR(annualisedTaxableIncomeCents)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Annualised Tax Estimate</span>
                <span className="text-white font-mono">{formatZAR(annualisedTaxCalc.netTax)}</span>
              </div>
            </div>
          </div>

          {/* Right: reserve vs liability */}
          <div className="space-y-3">
            <p className="text-[10px] text-muted uppercase tracking-widest">Reserve Health Check</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl">
                <p className="text-[10px] text-gold">Tax Reserve ({taxReservePct}%)</p>
                <p className="text-lg font-bold font-mono text-gold">{formatZAR(taxReserveAccumulatedCents)}</p>
                <p className="text-[10px] text-muted">Accumulated YTD</p>
              </div>
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-[10px] text-danger">Estimated Tax</p>
                <p className="text-lg font-bold font-mono text-danger">{formatZAR(taxCalc.netTax)}</p>
                <p className="text-[10px] text-muted">Current liability</p>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isOverReserving ? 'bg-accent/10 border-accent/20' : 'bg-danger/10 border-danger/20'}`}>
              <div className="flex items-center gap-2">
                {isOverReserving
                  ? <CheckCircle size={14} className="text-accent" />
                  : <AlertTriangle size={14} className="text-danger" />}
                <p className={`text-sm font-medium ${isOverReserving ? 'text-accent' : 'text-danger'}`}>
                  {isOverReserving ? 'Over-reserving' : 'Under-reserving'}
                </p>
              </div>
              <p className="text-xs text-white mt-1">
                {isOverReserving
                  ? `Reserve exceeds liability by ${formatZAR(Math.abs(over))}`
                  : `Reserve SHORT by ${formatZAR(Math.abs(over))} — consider increasing tax reserve %`}
              </p>
            </div>

            {/* Receipt overrides */}
            {receiptOverrideCount > 0 && (
              <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl">
                <p className="text-xs text-gold font-medium">
                  ⚠ {receiptOverrideCount} deductible expense{receiptOverrideCount > 1 ? 's' : ''} missing receipts
                </p>
                <p className="text-[10px] text-muted mt-0.5">These may be challenged in a SARS audit</p>
              </div>
            )}

            {/* Snapshot */}
            <div className="border-t border-border pt-3">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Save Snapshot</p>
              <input
                value={snapshotLabel}
                onChange={e => setSnapshotLabel(e.target.value)}
                placeholder="Optional label (e.g. 'Before P1 filing')"
                className="w-full bg-raised border border-border rounded-lg px-3 py-2 text-xs text-white
                  placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent mb-2"
              />
              <Button variant="secondary" size="sm" onClick={handleSaveSnapshot} loading={savingSnapshot} className="w-full">
                <Camera size={12} />
                Save Current Figures as Snapshot
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deductible expenses table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Deductible Expenses</p>
          <span className="text-xs text-muted">{deductibleExpenses.length} entries · {formatZAR(totalDeductionsCents)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {['Date', 'Vendor', 'Category', 'Description', 'Amount', 'Receipt'].map(h => (
                  <th key={h} className="px-4 py-2 text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {deductibleExpenses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No deductible expenses yet</td></tr>
              ) : deductibleExpenses.map((e: any) => (
                <tr key={e._id} className="hover:bg-raised/30 transition-colors">
                  <td className="px-4 py-2 text-muted font-mono">{formatDate(e.date)}</td>
                  <td className="px-4 py-2 text-white">{e.vendor ?? '—'}</td>
                  <td className="px-4 py-2 text-muted">{e.categoryLabel}</td>
                  <td className="px-4 py-2 text-muted max-w-[200px] truncate">{e.description}</td>
                  <td className="px-4 py-2 text-white font-mono font-semibold">{formatZAR(e.amountCents)}</td>
                  <td className="px-4 py-2">
                    {e.receiptUrl
                      ? <a href={e.receiptUrl} target="_blank" className="text-accent hover:underline">View</a>
                      : e.receiptOverrideReason
                        ? <span className="text-gold" title={e.receiptOverrideReason}>Override ⚠</span>
                        : <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past snapshots */}
      {snapshots && snapshots.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-sm font-semibold text-white">Saved Snapshots</p>
          </div>
          <div className="divide-y divide-border/50">
            {snapshots.map((s: any) => (
              <div key={s._id} className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-muted">Date</p>
                  <p className="text-white">{formatDate(s.calculatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted">Period</p>
                  <p className="text-white capitalize">{s.period} {s.snapshotLabel ? `· ${s.snapshotLabel}` : ''}</p>
                </div>
                <div>
                  <p className="text-muted">Gross Income</p>
                  <p className="text-white font-mono">{formatZAR(s.grossIncomeCents)}</p>
                </div>
                <div>
                  <p className="text-muted">Taxable Income</p>
                  <p className="text-white font-mono">{formatZAR(s.estimatedTaxableIncomeCents)}</p>
                </div>
                <div>
                  <p className="text-muted">Est. Tax</p>
                  <p className="text-danger font-mono font-semibold">{formatZAR(s.estimatedTaxCents)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TaxLine({
  label, value, bold, accent
}: {
  label: string
  value: number
  bold?: boolean
  accent?: string
}) {
  const isNeg = value < 0
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? 'text-white font-semibold' : 'text-muted'}`}>{label}</span>
      <span className={`text-xs font-mono ${bold ? 'font-bold text-sm' : ''} ${accent ?? (isNeg ? 'text-accent' : 'text-white')}`}>
        {isNeg ? `-${formatZAR(Math.abs(value))}` : formatZAR(value)}
      </span>
    </div>
  )
}
