'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Button } from '@/components/ui/Forms'
import { addIncome } from '@/actions/income'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface AddIncomeModalProps {
  open: boolean
  onClose: () => void
  hourlyRateCents: number
}

export function AddIncomeModal({ open, onClose, hourlyRateCents }: AddIncomeModalProps) {
  const [type, setType] = useState<'hours_base' | 'bonus' | 'other'>('hours_base')
  const [hours, setHours] = useState('')
  const [amount, setAmount] = useState('')
  const [clientRef, setClientRef] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  const computedAmount = type === 'hours_base' && hours
    ? ((parseFloat(hours) * hourlyRateCents) / 100).toFixed(2)
    : amount

  async function handleSubmit() {
    if (!description) { error('Description is required'); return }
    const amt = type === 'hours_base' && hours ? computedAmount : amount
    if (!amt || parseFloat(amt) <= 0) { error('Enter a valid amount'); return }

    setLoading(true)
    const res = await addIncome({
      type,
      amountStr: amt,
      hoursLogged: type === 'hours_base' && hours ? parseFloat(hours) : undefined,
      clientRef: clientRef || undefined,
      date,
      description,
    })
    setLoading(false)

    if (res.success) {
      success('Income entry added')
      setHours(''); setAmount(''); setClientRef(''); setDescription('')
      onClose()
      router.refresh()
    } else {
      error(res.error ?? 'Failed to add income')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Income" size="md">
      <div className="space-y-4">
        <Select
          label="Income Type"
          value={type}
          onChange={e => setType(e.target.value as any)}
        >
          <option value="hours_base">Hours × Rate (Base)</option>
          <option value="bonus">Bonus / Retainer</option>
          <option value="other">Other Income</option>
        </Select>

        {type === 'hours_base' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hours Logged"
              type="number" step="0.5" min="0"
              placeholder="0"
              value={hours}
              onChange={e => setHours(e.target.value)}
              hint={`R${(hourlyRateCents / 100).toFixed(2)}/hr → R${computedAmount || '0.00'}`}
            />
            <Input
              label="Or Enter Amount Directly (ZAR)"
              type="number" step="0.01" min="0"
              placeholder="Leave blank to use hours"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={!!hours}
            />
          </div>
        )}

        {type !== 'hours_base' && (
          <Input
            label="Amount (ZAR) *"
            type="number" step="0.01" min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Input
            label="Client Reference"
            placeholder="e.g. Client A"
            value={clientRef}
            onChange={e => setClientRef(e.target.value)}
          />
        </div>

        <Input
          label="Description *"
          placeholder="e.g. March invoices, Q1 bonus"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {type === 'hours_base' && hours && (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
            <p className="text-xs text-accent">
              <span className="font-semibold">{hours}h × R{(hourlyRateCents / 100).toFixed(2)}/hr</span>
              {' = '}
              <span className="font-bold text-sm">R {computedAmount}</span>
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">
            Add Income
          </Button>
        </div>
      </div>
    </Modal>
  )
}
