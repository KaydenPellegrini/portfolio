'use client'

import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Button } from '@/components/ui/Forms'
import { formatZAR, parseToCents } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { BUCKET_LABELS, BUCKETS, type Bucket } from '@/lib/constants'

// Server action — inline for simplicity (called via API)
async function transferBetweenBuckets(input: {
  monthKey: string
  fromBucket: Bucket
  toBucket: Bucket
  amountCents: number
  reason: string
}) {
  // This transfers by creating one "negative" expense offset in from-bucket
  // and one in to-bucket. We log it as a special transfer category.
  const res = await fetch('/api/bucket-transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.json()
}

interface BucketTransferModalProps {
  open: boolean
  onClose: () => void
  monthKey: string
  bucketAllocated: Record<Bucket, number>
  bucketSpend: Record<Bucket, number>
}

export function BucketTransferModal({
  open, onClose, monthKey, bucketAllocated, bucketSpend
}: BucketTransferModalProps) {
  const [fromBucket, setFromBucket] = useState<Bucket>('wants')
  const [toBucket, setToBucket] = useState<Bucket>('needs')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  const fromHeadroom = bucketAllocated[fromBucket] - bucketSpend[fromBucket]
  const toRemaining = bucketAllocated[toBucket] - bucketSpend[toBucket]

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) { error('Enter a valid amount'); return }
    if (!reason.trim() || reason.trim().length < 10) { error('Please provide a reason (min 10 chars)'); return }
    if (fromBucket === toBucket) { error('Source and destination must be different'); return }

    const amountCents = parseToCents(amount)
    if (amountCents > fromHeadroom && fromHeadroom > 0) {
      const ok = window.confirm(
        `This transfer exceeds the remaining headroom in ${BUCKET_LABELS[fromBucket]} (${formatZAR(fromHeadroom)}). Continue?`
      )
      if (!ok) return
    }

    setLoading(true)
    const res = await transferBetweenBuckets({ monthKey, fromBucket, toBucket, amountCents, reason })
    setLoading(false)

    if (res.success) {
      success(`Transferred ${formatZAR(amountCents)} from ${BUCKET_LABELS[fromBucket]} → ${BUCKET_LABELS[toBucket]}`)
      setAmount('')
      setReason('')
      onClose()
      router.refresh()
    } else {
      error(res.error ?? 'Transfer failed')
    }
  }

  const otherBuckets = BUCKETS.filter(b => b !== fromBucket)

  return (
    <Modal open={open} onClose={onClose} title="Transfer Between Buckets" size="sm">
      <div className="space-y-4">
        <div className="p-3 bg-raised rounded-xl">
          <p className="text-[10px] text-muted mb-2">
            Transfers move allocation between buckets and are logged in your expense history for audit.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {BUCKETS.map(b => {
              const headroom = bucketAllocated[b] - bucketSpend[b]
              return (
                <div key={b} className="p-2 bg-surface rounded-lg">
                  <p className="text-muted capitalize">{b}</p>
                  <p className={`font-mono font-semibold ${headroom < 0 ? 'text-danger' : 'text-white'}`}>
                    {formatZAR(Math.abs(headroom))}
                  </p>
                  <p className="text-[9px] text-muted">{headroom < 0 ? 'over' : 'headroom'}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <Select
            label="From"
            value={fromBucket}
            onChange={e => {
              setFromBucket(e.target.value as Bucket)
              if (e.target.value === toBucket) setToBucket(BUCKETS.find(b => b !== e.target.value) as Bucket)
            }}
          >
            {BUCKETS.map(b => <option key={b} value={b}>{BUCKET_LABELS[b]}</option>)}
          </Select>
          <div className="pb-2.5 text-muted">
            <ArrowLeftRight size={14} />
          </div>
          <Select
            label="To"
            value={toBucket}
            onChange={e => setToBucket(e.target.value as Bucket)}
          >
            {BUCKETS.filter(b => b !== fromBucket).map(b => (
              <option key={b} value={b}>{BUCKET_LABELS[b]}</option>
            ))}
          </Select>
        </div>

        <Input
          label="Amount (ZAR)"
          type="number"
          step="50"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          hint={fromHeadroom > 0 ? `Available headroom in ${BUCKET_LABELS[fromBucket]}: ${formatZAR(fromHeadroom)}` : undefined}
        />

        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1">
            Reason * (min 10 chars)
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Moved Wants surplus to cover unexpected medical expense"
            rows={2}
            className="w-full bg-raised border border-border rounded-lg px-3 py-2 text-sm text-white
              placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
          <p className={`text-[10px] mt-0.5 ${reason.length >= 10 ? 'text-accent' : 'text-muted'}`}>
            {reason.length} / 10 minimum
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">
            Transfer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
