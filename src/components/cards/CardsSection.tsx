'use client'

import { useState } from 'react'
import { CreditCard as CreditCardIcon, Plus, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Calculator, FileText } from 'lucide-react'
import { formatZAR, pct, utilizationColor } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Button } from '@/components/ui/Forms'
import { recordCardPayment, addCard } from '@/actions/cards'
import { PayoffSimulator } from '@/components/cards/PayoffSimulator'
import { CardStatement } from '@/components/cards/CardStatement'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { STORE_CARD_RETAILERS, CARD_TYPES } from '@/lib/constants'

interface Card {
  _id: string
  name: string
  type: string
  retailer?: string
  last4?: string
  limitCents: number
  currentBalanceCents: number
  minPaymentCents: number
  statementDueDay: number
  apr: number
  rewards?: string
}

interface CardsSectionProps {
  cards: Card[]
  totalBalanceCents: number
  totalLimitCents: number
  totalMinPaymentsCents: number
  overallUtilizationPct: number
  weightedApr: number
}

export function CardsSection({ cards, totalBalanceCents, totalLimitCents, totalMinPaymentsCents, overallUtilizationPct, weightedApr }: CardsSectionProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [payingCard, setPayingCard] = useState<Card | null>(null)
  const [simulatorCard, setSimulatorCard] = useState<Card | null>(null)
  const [statementCard, setStatementCard] = useState<Card | null>(null)
  const [expanded, setExpanded] = useState(true)
  const router = useRouter()

  const daysUntilDue = (dueDay: number) => {
    const today = new Date().getDate()
    const diff = dueDay - today
    return diff < 0 ? diff + 30 : diff
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <CreditCardIcon size={15} className="text-accent" />
          <span className="text-sm font-semibold text-white">Credit Exposure</span>
          {overallUtilizationPct >= 70 && (
            <AlertTriangle size={13} className="text-gold" />
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-mono font-bold ${overallUtilizationPct >= 70 ? 'text-gold' : 'text-muted'}`}>
            {overallUtilizationPct}% used
          </span>
          <button
            onClick={e => { e.stopPropagation(); setShowAddCard(true) }}
            className="p-1 text-muted hover:text-accent transition-colors"
          >
            <Plus size={14} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Summary bar */}
          <div className="px-4 py-3 border-b border-border/50 grid grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-muted">Total Owed</p>
              <p className="text-sm font-bold font-mono text-white">{formatZAR(totalBalanceCents)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Total Limit</p>
              <p className="text-sm font-mono text-muted">{formatZAR(totalLimitCents)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Monthly Minimums</p>
              <p className="text-sm font-mono text-gold">{formatZAR(totalMinPaymentsCents)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Weighted APR</p>
              <p className="text-sm font-mono text-muted">{weightedApr.toFixed(1)}%</p>
            </div>
          </div>

          {/* Card widgets */}
          {cards.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted mb-3">No cards added yet</p>
              <Button variant="secondary" size="sm" onClick={() => setShowAddCard(true)}>
                <Plus size={13} /> Add Card
              </Button>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map(card => {
                const util = pct(card.currentBalanceCents, card.limitCents)
                const daysLeft = daysUntilDue(card.statementDueDay)
                const urgentPayment = daysLeft <= 7
                const utilColor = util >= 90 ? 'text-danger' : util >= 70 ? 'text-gold' : 'text-accent'
                const barColor = util >= 90 ? 'bg-danger' : util >= 70 ? 'bg-gold' : 'bg-accent'

                return (
                  <div key={card._id}
                    className={`p-3 rounded-xl border transition-colors card-hover
                      ${util >= 70 ? 'border-gold/30 bg-gold/5' : 'border-border bg-raised/50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-white">{card.name}</p>
                        <p className="text-[10px] text-muted">
                          {card.last4 ? `••••${card.last4}` : card.type}
                          {card.retailer ? ` · ${card.retailer}` : ''}
                        </p>
                      </div>
                      <span className={`text-xs font-bold font-mono ${utilColor}`}>{util}%</span>
                    </div>

                    {/* Util bar */}
                    <div className="h-1 bg-border rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width: `${Math.min(util, 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[10px] text-muted">Balance</p>
                        <p className="text-xs font-mono font-semibold text-white">{formatZAR(card.currentBalanceCents)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Limit</p>
                        <p className="text-xs font-mono text-muted">{formatZAR(card.limitCents)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Min Payment</p>
                        <p className={`text-xs font-mono ${urgentPayment ? 'text-danger' : 'text-white'}`}>
                          {formatZAR(card.minPaymentCents)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Due In</p>
                        <p className={`text-xs font-mono ${urgentPayment ? 'text-danger' : 'text-muted'}`}>
                          {daysLeft <= 0 ? 'Today/Overdue' : `${daysLeft}d (day ${card.statementDueDay})`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setPayingCard(card)}
                        className="py-1.5 text-xs font-medium text-white bg-raised border border-border
                          rounded-lg hover:border-accent/50 hover:text-accent transition-colors flex items-center justify-center gap-1"
                      >
                        <TrendingDown size={11} />
                        Pay
                      </button>
                      <button
                        onClick={() => setSimulatorCard(card)}
                        className="py-1.5 text-xs font-medium text-muted bg-raised border border-border
                          rounded-lg hover:border-accent/50 hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Calculator size={11} />
                        Payoff
                      </button>
                      <button
                        onClick={() => setStatementCard(card)}
                        className="py-1.5 text-xs font-medium text-muted bg-raised border border-border
                          rounded-lg hover:border-accent/50 hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText size={11} />
                        Stmt
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Add Card Modal */}
      <AddCardModal open={showAddCard} onClose={() => setShowAddCard(false)} />

      {/* Record Payment Modal */}
      {payingCard && (
        <RecordPaymentModal
          card={payingCard}
          open={!!payingCard}
          onClose={() => setPayingCard(null)}
        />
      )}

      {/* Payoff Simulator */}
      {simulatorCard && (
        <PayoffSimulator
          open={!!simulatorCard}
          onClose={() => setSimulatorCard(null)}
          card={simulatorCard}
        />
      )}

      {/* Card Statement */}
      {statementCard && (
        <CardStatement
          open={!!statementCard}
          onClose={() => setStatementCard(null)}
          card={statementCard}
        />
      )}
    </div>
  )
}

function RecordPaymentModal({ card, open, onClose }: { card: Card; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) { error('Enter a valid amount'); return }
    setLoading(true)
    const res = await recordCardPayment({ cardId: card._id, amountStr: amount, date })
    setLoading(false)
    if (res.success) {
      success(`Payment recorded for ${card.name}`)
      setAmount('')
      onClose()
      router.refresh()
    } else error(res.error ?? 'Failed')
  }

  return (
    <Modal open={open} onClose={onClose} title={`Pay — ${card.name}`} size="sm">
      <div className="space-y-4">
        <div className="p-3 bg-raised rounded-xl grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted">Current Balance</p>
            <p className="text-sm font-bold font-mono text-danger">{formatZAR(card.currentBalanceCents)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted">Min Payment</p>
            <p className="text-sm font-mono text-gold">{formatZAR(card.minPaymentCents)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAmount((card.minPaymentCents / 100).toFixed(2))}>
            Min ({formatZAR(card.minPaymentCents)})
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAmount((card.currentBalanceCents / 100).toFixed(2))}>
            Full ({formatZAR(card.currentBalanceCents)})
          </Button>
        </div>
        <Input label="Payment Amount (ZAR)" type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">Record Payment</Button>
        </div>
      </div>
    </Modal>
  )
}

function AddCardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('general')
  const [retailer, setRetailer] = useState('')
  const [last4, setLast4] = useState('')
  const [limit, setLimit] = useState('')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [minPayment, setMinPayment] = useState('0')
  const [dueDay, setDueDay] = useState(1)
  const [apr, setApr] = useState(0)
  const [rewards, setRewards] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  async function handleSubmit() {
    if (!name || !limit) { error('Name and limit are required'); return }
    setLoading(true)
    const res = await addCard({ name, type, retailer: type !== 'general' ? retailer : undefined, last4, limitStr: limit, openingBalanceStr: openingBalance, minPaymentStr: minPayment, statementDueDay: dueDay, apr, rewards })
    setLoading(false)
    if (res.success) {
      success('Card added')
      onClose()
      router.refresh()
    } else error('Failed to add card')
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Card" size="md">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Card Name *" placeholder="e.g. FNB Platinum Visa" value={name} onChange={e => setName(e.target.value)} />
          <Select label="Type" value={type} onChange={e => setType(e.target.value)}>
            <option value="general">General Bank Card</option>
            <option value="store">Store Card</option>
            <option value="bnpl">Buy Now Pay Later</option>
          </Select>
        </div>
        {type !== 'general' && (
          <Select label="Retailer" value={retailer} onChange={e => setRetailer(e.target.value)}>
            <option value="">Select…</option>
            {STORE_CARD_RETAILERS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Last 4 Digits" maxLength={4} placeholder="1234" value={last4} onChange={e => setLast4(e.target.value)} />
          <Input label="APR (%)" type="number" step="0.1" value={apr} onChange={e => setApr(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Credit Limit (ZAR) *" type="number" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} />
          <Input label="Current Balance Owed (ZAR)" type="number" step="0.01" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} hint="Balance on day you add this card" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min Monthly Payment (ZAR)" type="number" step="0.01" value={minPayment} onChange={e => setMinPayment(e.target.value)} />
          <Input label="Statement Due Day" type="number" min={1} max={31} value={dueDay} onChange={e => setDueDay(parseInt(e.target.value) || 1)} />
        </div>
        <Input label="Rewards / Notes" placeholder="e.g. 2% cashback on groceries" value={rewards} onChange={e => setRewards(e.target.value)} />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">Add Card</Button>
        </div>
      </div>
    </Modal>
  )
}
