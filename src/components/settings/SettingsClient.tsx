'use client'

import { useState } from 'react'
import { Settings, DollarSign, Percent, CreditCard, RefreshCw, List, Save, Download } from 'lucide-react'
import { Input, Select, Toggle, Button, Card } from '@/components/ui/Forms'
import { updateSettings, addRecurring, deleteRecurring, updateRecurring } from '@/actions/settings'
import { updateCard } from '@/actions/cards'
import { useToast } from '@/components/ui/Toast'
import { formatZAR, centsToDecimalStr } from '@/lib/format'
import { BUILT_IN_CATEGORIES, PAYMENT_METHODS, FREQUENCIES } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export function SettingsClient({ settings: initialSettings, cards, recurrings: initialRecurrings }: {
  settings: any
  cards: any[]
  recurrings: any[]
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [recurrings, setRecurrings] = useState(initialRecurrings)
  const [activeSection, setActiveSection] = useState('income')
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()
  const router = useRouter()

  async function saveSettings(patch: any) {
    setSaving(true)
    const res = await updateSettings(patch)
    setSaving(false)
    if (res.success) { success('Settings saved'); router.refresh() }
    else error(res.error ?? 'Failed')
  }

  const sections = [
    { id: 'income',    label: 'Income & Tax',     icon: DollarSign },
    { id: 'buckets',   label: 'Buckets',           icon: Percent },
    { id: 'cards',     label: 'Cards',             icon: CreditCard },
    { id: 'recurring', label: 'Recurring',         icon: RefreshCw },
    { id: 'tax',       label: 'Tax Config',        icon: List },
    { id: 'data',      label: 'Data & Backup',     icon: Download },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} className="text-accent" />
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors
                ${activeSection === s.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-white hover:bg-raised'}`}>
              <s.icon size={14} />{s.label}
            </button>
          ))}
        </nav>

        {/* Mobile tab picker */}
        <div className="md:hidden w-full mb-4">
          <Select value={activeSection} onChange={e => setActiveSection(e.target.value)}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {activeSection === 'income' && (
            <IncomeSettings settings={settings} onSave={saveSettings} saving={saving} />
          )}

          {activeSection === 'buckets' && (
            <BucketSettings settings={settings} onSave={saveSettings} saving={saving} />
          )}

          {activeSection === 'cards' && (
            <CardsSettings cards={cards} router={router} />
          )}

          {activeSection === 'recurring' && (
            <RecurringSettings recurrings={recurrings} router={router} />
          )}

          {activeSection === 'tax' && (
            <TaxSettings settings={settings} onSave={saveSettings} saving={saving} />
          )}

          {activeSection === 'data' && (
            <DataSettings />
          )}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {children}
    </div>
  )
}

function IncomeSettings({ settings, onSave, saving }: any) {
  const [rate, setRate] = useState(centsToDecimalStr(settings.hourlyRateCents))
  const [taxPct, setTaxPct] = useState(String(settings.taxReservePct))
  const [phonePct, setPhonePct] = useState(String(settings.businessPhonePct))
  const [officePct, setOfficePct] = useState(String(settings.homeOfficePct))

  return (
    <SectionCard title="Income & Tax Reserve">
      <Input
        label="Hourly Rate (ZAR, CTC)"
        type="number" step="0.01"
        value={rate}
        onChange={e => setRate(e.target.value)}
        hint="Your billing rate per hour — default R110.00"
      />
      <Input
        label="Tax Reserve % (of Gross)"
        type="number" step="1" min="0" max="50"
        value={taxPct}
        onChange={e => setTaxPct(e.target.value)}
        hint="This % of gross income is ring-fenced for SARS. Conservative default: 30%"
      />
      <Input
        label="Business Phone/Internet Use %"
        type="number" step="1" min="0" max="100"
        value={phonePct}
        onChange={e => setPhonePct(e.target.value)}
        hint="% of your phone/internet bill that is business use (for deduction calculation)"
      />
      <Input
        label="Home Office Floor Area %"
        type="number" step="0.5" min="0" max="100"
        value={officePct}
        onChange={e => setOfficePct(e.target.value)}
        hint="Office sqm ÷ Total home sqm × 100. Used to estimate home office deduction."
      />
      <Button
        variant="primary"
        loading={saving}
        onClick={() => onSave({
          hourlyRateStr: rate,
          taxReservePct: parseFloat(taxPct),
          businessPhonePct: parseFloat(phonePct),
          homeOfficePct: parseFloat(officePct),
        })}
      >
        <Save size={13} /> Save
      </Button>
    </SectionCard>
  )
}

function BucketSettings({ settings, onSave, saving }: any) {
  const alloc = settings.defaultBucketAllocation ?? { needs: 50, wants: 30, savings: 20 }
  const [needs, setNeeds] = useState(String(alloc.needs))
  const [wants, setWants] = useState(String(alloc.wants))
  const [savings, setSavings] = useState(String(alloc.savings))
  const total = parseFloat(needs || '0') + parseFloat(wants || '0') + parseFloat(savings || '0')

  return (
    <SectionCard title="Default Bucket Allocation">
      <p className="text-xs text-muted">
        Set the default percentage allocation for each bucket when a new month is created.
        Must sum to 100%. You can override this per-month from the dashboard.
      </p>
      <Input label="Needs %" type="number" step="1" min="0" max="100" value={needs} onChange={e => setNeeds(e.target.value)} />
      <Input label="Wants %" type="number" step="1" min="0" max="100" value={wants} onChange={e => setWants(e.target.value)} />
      <Input label="Savings %" type="number" step="1" min="0" max="100" value={savings} onChange={e => setSavings(e.target.value)} />
      <div className={`text-sm font-mono ${total === 100 ? 'text-accent' : 'text-danger'}`}>
        Total: {total}% {total !== 100 && '— must equal 100%'}
      </div>
      <Button
        variant="primary"
        loading={saving}
        disabled={total !== 100}
        onClick={() => onSave({ defaultBucketAllocation: { needs: parseFloat(needs), wants: parseFloat(wants), savings: parseFloat(savings) } })}
      >
        <Save size={13} /> Save
      </Button>
    </SectionCard>
  )
}

function CardsSettings({ cards, router }: { cards: any[]; router: any }) {
  const { success, error } = useToast()

  async function toggleActive(id: string, current: boolean) {
    const res = await updateCard(id, { isActive: !current })
    if (res.success) { success('Card updated'); router.refresh() }
    else error('Failed')
  }

  return (
    <SectionCard title="Cards Management">
      <p className="text-xs text-muted">Add and manage cards from the Credit Exposure section on the dashboard. Here you can archive inactive cards.</p>
      {cards.length === 0
        ? <p className="text-sm text-muted italic">No cards added yet</p>
        : (
          <div className="space-y-2">
            {cards.map(c => (
              <div key={c._id} className="flex items-center gap-3 p-3 bg-raised rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.type} {c.last4 ? `· ••••${c.last4}` : ''} · Limit {formatZAR(c.limitCents)} · Balance {formatZAR(c.currentBalanceCents)}
                  </p>
                </div>
                <Toggle
                  label={c.isActive ? 'Active' : 'Archived'}
                  checked={c.isActive}
                  onChange={() => toggleActive(c._id, c.isActive)}
                />
              </div>
            ))}
          </div>
        )}
    </SectionCard>
  )
}

function RecurringSettings({ recurrings, router }: { recurrings: any[]; router: any }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [freq, setFreq] = useState('monthly')
  const [dueDay, setDueDay] = useState('1')
  const [catId, setCatId] = useState('rent_bond')
  const [bucket, setBucket] = useState('needs')
  const [pm, setPm] = useState('debit')
  const [isDeductible, setIsDeductible] = useState(false)
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  async function handleAdd() {
    if (!name || !amount) { error('Name and amount required'); return }
    setSaving(true)
    const catDef = BUILT_IN_CATEGORIES.find(c => c.id === catId)
    const res = await addRecurring({
      name, amountStr: amount, frequency: freq,
      dueDay: parseInt(dueDay), categoryId: catId,
      categoryLabel: catDef?.label ?? catId, bucket,
      paymentMethod: pm, isDeductible,
    })
    setSaving(false)
    if (res.success) {
      success('Recurring added')
      setName(''); setAmount(''); setShowAdd(false)
      router.refresh()
    } else error(res.error ?? 'Failed')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring?')) return
    const res = await deleteRecurring(id)
    if (res.success) { success('Deleted'); router.refresh() }
    else error('Failed')
  }

  async function handleToggleActive(id: string, current: boolean) {
    const res = await updateRecurring(id, { isActive: !current })
    if (res.success) { success('Updated'); router.refresh() }
    else error('Failed')
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Recurring Expenses">
        {recurrings.length === 0
          ? <p className="text-sm text-muted italic">No recurring expenses set up</p>
          : (
            <div className="space-y-2">
              {recurrings.map(r => (
                <div key={r._id} className={`flex items-center gap-3 p-3 rounded-xl border
                  ${r.isActive ? 'bg-raised border-border' : 'bg-raised/40 border-border/40 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{r.name}</p>
                    <p className="text-xs text-muted">
                      {formatZAR(r.amountCents)} · {r.frequency} · Day {r.dueDay} · {r.bucket}
                    </p>
                  </div>
                  <Toggle label="" checked={r.isActive} onChange={() => handleToggleActive(r._id, r.isActive)} />
                  <button onClick={() => handleDelete(r._id)} className="text-muted hover:text-danger text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}
      </SectionCard>

      {showAdd ? (
        <SectionCard title="Add Recurring Expense">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rent, Netflix" />
            <Input label="Amount (ZAR)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
            <Select label="Frequency" value={freq} onChange={e => setFreq(e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </Select>
            <Input label="Due Day (of month)" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} />
            <Select label="Category" value={catId} onChange={e => { setCatId(e.target.value); const d = BUILT_IN_CATEGORIES.find(c => c.id === e.target.value); if (d) setBucket(d.bucket) }}>
              {BUILT_IN_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Select label="Payment Method" value={pm} onChange={e => setPm(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </Select>
          </div>
          <Toggle label="Tax Deductible" checked={isDeductible} onChange={setIsDeductible} />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} loading={saving}>Add Recurring</Button>
          </div>
        </SectionCard>
      ) : (
        <Button variant="secondary" onClick={() => setShowAdd(true)}>+ Add Recurring Expense</Button>
      )}
    </div>
  )
}

function TaxSettings({ settings, onSave, saving }: any) {  const [taxYear, setTaxYear] = useState(settings.currentTaxYear ?? '2025/26')
  const [reminders, setReminders] = useState(settings.filingReminders ?? true)

  return (
    <SectionCard title="Tax Configuration">
      <Input
        label="Current Tax Year"
        placeholder="e.g. 2025/26"
        value={taxYear}
        onChange={e => setTaxYear(e.target.value)}
        hint="SARS tax year format: YYYY/YY (e.g. 2025/26 = 1 Mar 2025 – 28 Feb 2026)"
      />
      <Toggle
        label="IRP6 Filing Deadline Reminders"
        checked={reminders}
        onChange={setReminders}
        hint="Show banners 60, 30, 14, and 7 days before each provisional tax deadline"
      />
      <Button
        variant="primary"
        loading={saving}
        onClick={() => onSave({ currentTaxYear: taxYear, filingReminders: reminders })}
      >
        <Save size={13} /> Save
      </Button>

      <div className="mt-2 p-3 bg-gold/10 border border-gold/20 rounded-xl">
        <p className="text-xs text-gold font-medium mb-1">SARS 2025/26 Tax Brackets</p>
        <p className="text-[10px] text-muted">
          Tax brackets are pre-loaded for 2025/26. Update them in Settings every 1 March after the National Budget.
          Current primary rebate: R17,977. Brackets range from 18% (≤R237,800) to 45% (>R1,817,000).
        </p>
      </div>
    </SectionCard>
  )
}

function DataSettings() {
  const token = process.env.NEXT_PUBLIC_FINANCE_TOKEN ?? ''

  return (
    <div className="space-y-4">
      <SectionCard title="Data Export & Backup">
        <p className="text-xs text-muted">
          Download a full JSON backup of all your financial data — expenses, income, cards, transactions, and settings.
          Store this securely. It can be used to restore data if needed.
        </p>
        <a
          href={`/api/export?token=${token}`}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/20
            text-accent text-sm font-medium rounded-xl hover:bg-accent/20 transition-colors"
        >
          <Download size={14} />
          Download Full JSON Backup
        </a>
      </SectionCard>

      <SectionCard title="Tax Reports">
        <p className="text-xs text-muted mb-3">
          Open your IRP6 tax summary as a print-ready HTML page. Use your browser's Print → Save as PDF to get a PDF.
        </p>
        <a
          href={`/api/tax-report?token=${token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-raised border border-border
            text-white text-sm font-medium rounded-xl hover:border-accent/40 transition-colors"
        >
          <Download size={14} />
          Open Tax Summary (Print to PDF)
        </a>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <p className="text-xs text-muted mb-3">
          These actions are irreversible. Download a backup first.
        </p>
        <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl">
          <p className="text-xs text-danger font-medium mb-1">Clear All Data</p>
          <p className="text-[11px] text-muted mb-3">
            Permanently deletes all expenses, income entries, and resets card balances. 
            Settings and card definitions are preserved.
          </p>
          <button
            onClick={() => {
              const confirm1 = window.confirm('Are you sure? This cannot be undone.')
              if (!confirm1) return
              const typed = window.prompt('Type DELETE to confirm:')
              if (typed === 'DELETE') {
                fetch('/api/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
                  .then(r => r.json())
                  .then(d => { if (d.success) window.location.reload() })
              }
            }}
            className="px-3 py-1.5 bg-danger/10 border border-danger/30 text-danger text-xs
              rounded-lg hover:bg-danger/20 transition-colors"
          >
            Clear All Transaction Data
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
