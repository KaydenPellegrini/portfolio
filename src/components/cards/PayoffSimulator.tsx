'use client'

import { useState, useMemo } from 'react'
import { TrendingDown, Calculator } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input, Button } from '@/components/ui/Forms'
import { formatZAR } from '@/lib/format'

interface PayoffSimulatorProps {
  open: boolean
  onClose: () => void
  card: {
    name: string
    currentBalanceCents: number
    apr: number
    minPaymentCents: number
  }
}

interface PayoffResult {
  months: number
  totalInterestCents: number
  totalPaidCents: number
}

function calculatePayoff(balanceCents: number, aprPct: number, monthlyPaymentCents: number): PayoffResult | null {
  if (monthlyPaymentCents <= 0 || balanceCents <= 0) return null
  const monthlyRate = aprPct / 100 / 12
  if (monthlyRate === 0) {
    const months = Math.ceil(balanceCents / monthlyPaymentCents)
    return { months, totalInterestCents: 0, totalPaidCents: balanceCents }
  }

  // Check if payment covers at least interest
  const monthlyInterest = Math.round(balanceCents * monthlyRate)
  if (monthlyPaymentCents <= monthlyInterest) return null // will never pay off

  let balance = balanceCents
  let months = 0
  let totalInterest = 0

  while (balance > 0 && months < 600) {
    const interest = Math.round(balance * monthlyRate)
    totalInterest += interest
    balance = balance + interest - monthlyPaymentCents
    months++
    if (balance < 0) balance = 0
  }

  return {
    months,
    totalInterestCents: totalInterest,
    totalPaidCents: balanceCents + totalInterest,
  }
}

export function PayoffSimulator({ open, onClose, card }: PayoffSimulatorProps) {
  const [customPayment, setCustomPayment] = useState(
    ((card.minPaymentCents * 2) / 100).toFixed(2)
  )

  const minResult = useMemo(
    () => calculatePayoff(card.currentBalanceCents, card.apr, card.minPaymentCents),
    [card]
  )

  const customResult = useMemo(
    () => calculatePayoff(
      card.currentBalanceCents,
      card.apr,
      Math.round(parseFloat(customPayment || '0') * 100)
    ),
    [card, customPayment]
  )

  const interestSaved = minResult && customResult
    ? minResult.totalInterestCents - customResult.totalInterestCents
    : 0

  const monthsSaved = minResult && customResult
    ? minResult.months - customResult.months
    : 0

  function formatMonths(m: number) {
    if (m >= 12) {
      const yrs = Math.floor(m / 12)
      const mos = m % 12
      return `${yrs}yr${yrs > 1 ? 's' : ''}${mos > 0 ? ` ${mos}mo` : ''}`
    }
    return `${m} month${m !== 1 ? 's' : ''}`
  }

  // Generate amortisation preview (first 12 months)
  function getSchedule(paymentCents: number, maxRows = 12) {
    if (paymentCents <= 0 || card.apr === 0) return []
    const monthlyRate = card.apr / 100 / 12
    let balance = card.currentBalanceCents
    const rows = []
    for (let i = 1; i <= maxRows && balance > 0; i++) {
      const interest = Math.round(balance * monthlyRate)
      const principal = Math.min(paymentCents - interest, balance)
      balance = Math.max(0, balance - principal)
      rows.push({ month: i, interest, principal, balance })
    }
    return rows
  }

  const customPaymentCents = Math.round(parseFloat(customPayment || '0') * 100)
  const schedule = getSchedule(customPaymentCents)

  return (
    <Modal open={open} onClose={onClose} title={`Payoff Simulator — ${card.name}`} size="lg">
      <div className="space-y-5">

        {/* Card summary */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-raised rounded-xl">
          <div>
            <p className="text-[10px] text-muted">Balance</p>
            <p className="text-sm font-bold font-mono text-danger">{formatZAR(card.currentBalanceCents)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">APR</p>
            <p className="text-sm font-bold font-mono text-white">{card.apr}%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Monthly Rate</p>
            <p className="text-sm font-bold font-mono text-white">{(card.apr / 12).toFixed(2)}%</p>
          </div>
        </div>

        {/* Minimum payment scenario */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Minimum Payment Only — {formatZAR(card.minPaymentCents)}/month
          </p>
          {!minResult ? (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
              <p className="text-xs text-danger font-medium">
                ⚠ Your minimum payment doesn't cover the interest. You will NEVER pay this off at the current rate.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Time to payoff', value: formatMonths(minResult.months), color: minResult.months > 36 ? 'text-danger' : 'text-white' },
                { label: 'Total interest', value: formatZAR(minResult.totalInterestCents), color: 'text-danger' },
                { label: 'Total paid', value: formatZAR(minResult.totalPaidCents), color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="p-2.5 bg-raised rounded-xl text-center">
                  <p className="text-[10px] text-muted">{s.label}</p>
                  <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom payment */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Input
              label="Custom Monthly Payment (ZAR)"
              type="number"
              step="100"
              min="0"
              value={customPayment}
              onChange={e => setCustomPayment(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 mb-3">
            {[1.5, 2, 3].map(mult => (
              <button
                key={mult}
                onClick={() => setCustomPayment(((card.minPaymentCents * mult) / 100).toFixed(2))}
                className="px-2.5 py-1 bg-raised border border-border rounded-lg text-xs text-muted hover:text-white transition-colors"
              >
                {mult}× min
              </button>
            ))}
            <button
              onClick={() => setCustomPayment((card.currentBalanceCents / 12 / 100).toFixed(2))}
              className="px-2.5 py-1 bg-raised border border-border rounded-lg text-xs text-muted hover:text-white transition-colors"
            >
              12mo plan
            </button>
          </div>

          {customResult ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Time to payoff', value: formatMonths(customResult.months), color: customResult.months <= 12 ? 'text-accent' : customResult.months <= 24 ? 'text-white' : 'text-gold' },
                  { label: 'Total interest', value: formatZAR(customResult.totalInterestCents), color: 'text-gold' },
                  { label: 'Total paid', value: formatZAR(customResult.totalPaidCents), color: 'text-white' },
                ].map(s => (
                  <div key={s.label} className="p-2.5 bg-raised rounded-xl text-center">
                    <p className="text-[10px] text-muted">{s.label}</p>
                    <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Savings vs minimum */}
              {interestSaved > 0 && (
                <div className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-3">
                  <TrendingDown size={16} className="text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Save {formatZAR(interestSaved)} in interest
                    </p>
                    <p className="text-xs text-muted">
                      Pay off {formatMonths(Math.abs(monthsSaved))} sooner than minimum payments
                    </p>
                  </div>
                </div>
              )}

              {/* Amortisation preview */}
              {schedule.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-2">
                    First {Math.min(schedule.length, 12)} months breakdown
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="pb-1.5 pr-3 text-muted font-medium">Month</th>
                          <th className="pb-1.5 pr-3 text-muted font-medium">Principal</th>
                          <th className="pb-1.5 pr-3 text-muted font-medium">Interest</th>
                          <th className="pb-1.5 text-muted font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {schedule.map(row => (
                          <tr key={row.month}>
                            <td className="py-1.5 pr-3 text-muted">{row.month}</td>
                            <td className="py-1.5 pr-3 text-accent font-mono">{formatZAR(row.principal)}</td>
                            <td className="py-1.5 pr-3 text-danger font-mono">{formatZAR(row.interest)}</td>
                            <td className="py-1.5 text-white font-mono">{formatZAR(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : customPaymentCents > 0 ? (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
              <p className="text-xs text-danger">Payment too low to cover interest at {card.apr}% APR</p>
            </div>
          ) : null}
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
      </div>
    </Modal>
  )
}
