'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, X, AlertCircle, Clock, Receipt } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Toggle, Button } from '@/components/ui/Forms'
import { BUILT_IN_CATEGORIES, PAYMENT_METHODS, BUCKETS, BUCKET_LABELS } from '@/lib/constants'
import { addExpense, addExpenseForce, updateExpense, type AddExpenseInput } from '@/actions/expenses'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

interface Card { _id: string; name: string; type: string; last4?: string }

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  cards: Card[]
  monthStatus: 'open' | 'closed'
  editExpense?: any   // pre-populated for edit mode
}

export function AddExpenseModal({ open, onClose, cards, monthStatus, editExpense }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [vendor, setVendor] = useState('')
  const [categoryId, setCategoryId] = useState('groceries')
  const [bucket, setBucket] = useState<string>('needs')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('debit')
  const [cardId, setCardId] = useState('')
  const [isDeductible, setIsDeductible] = useState(false)
  const [isForeign, setIsForeign] = useState(false)
  const [foreignCurrency, setForeignCurrency] = useState('USD')
  const [foreignAmount, setForeignAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [showOverride, setShowOverride] = useState(false)
  const [overrideTimer, setOverrideTimer] = useState(0)
  const [dupWarning, setDupWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { success, error, warning } = useToast()
  const router = useRouter()

  const catDef = BUILT_IN_CATEGORIES.find(c => c.id === categoryId)
  const receiptRequired = catDef?.receiptRequired ?? false
  const needsCardLink = paymentMethod === 'credit' || paymentMethod === 'store_card'

  // Populate edit mode
  useEffect(() => {
    if (editExpense && open) {
      setAmount((editExpense.amountCents / 100).toFixed(2))
      setDate(editExpense.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
      setVendor(editExpense.vendor ?? '')
      setCategoryId(editExpense.categoryId ?? 'groceries')
      setBucket(editExpense.bucket ?? 'needs')
      setDescription(editExpense.description ?? '')
      setPaymentMethod(editExpense.paymentMethod ?? 'debit')
      setCardId(editExpense.cardId ?? '')
      setIsDeductible(editExpense.isDeductible ?? false)
      setReceiptUrl(editExpense.receiptUrl ?? '')
    }
  }, [editExpense, open])

  // Auto-suggest bucket and deductible from category
  useEffect(() => {
    if (!editExpense) {
      setBucket(catDef?.bucket ?? 'needs')
      setIsDeductible(catDef?.defaultDeductible ?? false)
    }
  }, [categoryId, catDef, editExpense])

  // Receipt override timer
  function startOverrideTimer() {
    setOverrideTimer(5)
    timerRef.current = setInterval(() => {
      setOverrideTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setShowOverride(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  function reset() {
    setAmount(''); setVendor(''); setDescription(''); setReceiptUrl('')
    setOverrideReason(''); setShowOverride(false); setOverrideTimer(0)
    setDupWarning(null); setIsForeign(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function handleUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) { error('File too large (max 10 MB)'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) { setReceiptUrl(data.url); success('Receipt uploaded') }
      else error('Upload failed')
    } catch { error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleSubmit(force = false) {
    if (!amount || parseFloat(amount) <= 0) { error('Enter a valid amount'); return }
    if (!description) { error('Description is required'); return }
    if (receiptRequired && !receiptUrl && !overrideReason && !force) {
      if (!showOverride) { startOverrideTimer(); return }
    }

    setLoading(true)
    const input: AddExpenseInput = {
      amountStr: amount,
      date,
      vendor: vendor || undefined,
      categoryId,
      bucket,
      description,
      paymentMethod,
      cardId: needsCardLink ? cardId : undefined,
      isDeductible,
      receiptUrl: receiptUrl || undefined,
      receiptOverrideReason: overrideReason || undefined,
      isForeignCurrency: isForeign,
      foreignCurrency: isForeign ? foreignCurrency : undefined,
      foreignAmountStr: isForeign ? foreignAmount : undefined,
      exchangeRateStr: isForeign ? exchangeRate : undefined,
    }

    const res = editExpense
      ? await updateExpense(editExpense._id, input)
      : force
        ? await addExpenseForce(input)
        : await addExpense(input)

    setLoading(false)

    if (res.success) {
      success(editExpense ? 'Expense updated' : 'Expense added')
      reset()
      onClose()
      router.refresh()
    } else if (res.error === 'receipt_required') {
      warning('Receipt is required for this category')
    } else if (res.error === 'duplicate_warning') {
      setDupWarning((res as any).duplicateId ?? 'dup')
    } else {
      error(res.error ?? 'Something went wrong')
    }
  }

  const cardOptions = cards.filter(c => needsCardLink
    ? (paymentMethod === 'credit' ? c.type !== 'store' : c.type === 'store' || c.type === 'bnpl')
    : false
  )

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title={editExpense ? 'Edit Expense' : 'Add Expense'} size="lg">
      {monthStatus === 'closed' && (
        <div className="mb-4 px-3 py-2.5 bg-gold/10 border border-gold/20 rounded-lg text-xs text-gold">
          This month is closed — expenses cannot be added or edited.
        </div>
      )}

      <div className="space-y-4">
        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (ZAR)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Vendor + Description */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Vendor / Merchant"
            placeholder="e.g. Woolworths, Shell"
            value={vendor}
            onChange={e => setVendor(e.target.value)}
          />
          <Input
            label="Description *"
            placeholder="Brief description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Category + Bucket */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category *" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {['needs', 'wants', 'savings'].map(b => (
              <optgroup key={b} label={b.charAt(0).toUpperCase() + b.slice(1)}>
                {BUILT_IN_CATEGORIES.filter(c => c.bucket === b).map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Select
            label="Bucket *"
            value={bucket}
            onChange={e => setBucket(e.target.value)}
          >
            {BUCKETS.map(b => (
              <option key={b} value={b}>{BUCKET_LABELS[b]}</option>
            ))}
          </Select>
        </div>

        {/* Payment method + Card */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </Select>
          {needsCardLink && (
            <Select
              label="Linked Card *"
              value={cardId}
              onChange={e => setCardId(e.target.value)}
              error={needsCardLink && !cardId ? 'Select a card' : undefined}
            >
              <option value="">Select card…</option>
              {cards.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.last4 ? `(••${c.last4})` : ''}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <Toggle
            label="Tax Deductible"
            checked={isDeductible}
            onChange={setIsDeductible}
            hint={catDef?.deductibleNote}
          />
          <Toggle
            label="Foreign Currency"
            checked={isForeign}
            onChange={setIsForeign}
          />
        </div>

        {/* Foreign currency fields */}
        {isForeign && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-raised rounded-xl border border-border">
            <Select
              label="Currency"
              value={foreignCurrency}
              onChange={e => setForeignCurrency(e.target.value)}
            >
              {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'CNY'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Input
              label="Foreign Amount"
              type="number" step="0.01"
              placeholder="0.00"
              value={foreignAmount}
              onChange={e => setForeignAmount(e.target.value)}
            />
            <Input
              label="Exchange Rate (ZAR per 1)"
              type="number" step="0.0001"
              placeholder="18.50"
              value={exchangeRate}
              onChange={e => setExchangeRate(e.target.value)}
            />
          </div>
        )}

        {/* Receipt upload */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
            Receipt {receiptRequired ? <span className="text-danger">* Required</span> : '(Optional)'}
          </p>

          {receiptUrl ? (
            <div className="flex items-center gap-2 p-2.5 bg-accent/10 border border-accent/20 rounded-lg">
              <Receipt size={14} className="text-accent" />
              <span className="text-xs text-accent flex-1 truncate">Receipt attached</span>
              <button onClick={() => setReceiptUrl('')} className="text-muted hover:text-danger">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer
                  transition-colors ${receiptRequired ? 'border-danger/40 receipt-required' : 'border-border'}
                  hover:border-accent/50 bg-raised`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                {uploading
                  ? <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  : <Upload size={18} className={receiptRequired ? 'text-danger' : 'text-muted'} />}
                <span className="text-xs text-muted">
                  {uploading ? 'Uploading…' : 'Click or drag a receipt (JPG, PNG, PDF)'}
                </span>
              </label>

              {/* Override path — only appears after 5s */}
              {receiptRequired && !showOverride && overrideTimer > 0 && (
                <p className="text-xs text-muted mt-2 text-center">
                  "No receipt" option available in <span className="text-gold font-mono">{overrideTimer}s</span>
                </p>
              )}
              {receiptRequired && showOverride && (
                <div className="mt-2 p-3 bg-danger/5 border border-danger/20 rounded-lg space-y-2">
                  <p className="text-xs text-danger font-medium flex items-center gap-1.5">
                    <AlertCircle size={12} /> Override — written reason required (min 20 chars)
                  </p>
                  <textarea
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    placeholder="e.g. Informal market vendor — no POS machine available"
                    className="w-full bg-raised border border-border rounded-lg px-3 py-2 text-xs text-white
                      placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    rows={2}
                  />
                  <p className={`text-[10px] ${overrideReason.length >= 20 ? 'text-accent' : 'text-muted'}`}>
                    {overrideReason.length} / 20 minimum characters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Duplicate warning */}
        {dupWarning && (
          <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg">
            <p className="text-xs text-gold font-medium mb-2">
              ⚠ A similar expense was found (same vendor, amount, and date ±1 day). Duplicate?
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDupWarning(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => { setDupWarning(null); handleSubmit(true) }}>
                Add anyway
              </Button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => { reset(); onClose() }} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            loading={loading}
            disabled={monthStatus === 'closed'}
            className="flex-1"
          >
            {editExpense ? 'Update Expense' : 'Add Expense'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
