'use client'

import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts'
import { formatZAR, formatDateShort } from '@/lib/format'
import { BarChart2, TrendingUp, PieChart as PieIcon, CreditCard } from 'lucide-react'

interface AnalyticsClientProps {
  expenses: any[]
  incomeEntries: any[]
}

const COLORS = {
  needs:   '#3B82F6',
  wants:   '#A855F7',
  savings: '#00D4AA',
  income:  '#F5A623',
  tax:     '#E53E3E',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A2E',
  border: '1px solid #2E2E45',
  borderRadius: '12px',
  color: '#fff',
  fontSize: 12,
}

function zarTick(v: number) {
  if (v >= 1000000) return `R${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `R${(v / 1000).toFixed(0)}k`
  return `R${v}`
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })
}

export function AnalyticsClient({ expenses, incomeEntries }: AnalyticsClientProps) {
  const [activeChart, setActiveChart] = useState<'spend' | 'income' | 'categories' | 'deductible'>('spend')

  // ── Aggregate by month ────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; needs: number; wants: number; savings: number; income: number; taxReserve: number }>()

    for (const e of expenses) {
      const k = monthKey(e.date)
      const prev = map.get(k) ?? { month: monthLabel(k), needs: 0, wants: 0, savings: 0, income: 0, taxReserve: 0 }
      const b = e.bucket as 'needs' | 'wants' | 'savings'
      prev[b] += e.amountCents / 100
      map.set(k, prev)
    }
    for (const e of incomeEntries) {
      const k = monthKey(e.date)
      const prev = map.get(k) ?? { month: monthLabel(k), needs: 0, wants: 0, savings: 0, income: 0, taxReserve: 0 }
      prev.income += e.amountCents / 100
      map.set(k, prev)
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        ...v,
        total: v.needs + v.wants + v.savings,
        net: v.income - (v.needs + v.wants + v.savings),
      }))
  }, [expenses, incomeEntries])

  // ── Category pie data ─────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      map.set(e.categoryLabel, (map.get(e.categoryLabel) ?? 0) + e.amountCents / 100)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }, [expenses])

  // ── Deductible vs non-deductible by month ─────────────────────────────────
  const deductibleData = useMemo(() => {
    const map = new Map<string, { month: string; deductible: number; nonDeductible: number }>()
    for (const e of expenses) {
      const k = monthKey(e.date)
      const prev = map.get(k) ?? { month: monthLabel(k), deductible: 0, nonDeductible: 0 }
      if (e.isDeductible) prev.deductible += e.amountCents / 100
      else prev.nonDeductible += e.amountCents / 100
      map.set(k, prev)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [expenses])

  // ── Vendor top-20 ─────────────────────────────────────────────────────────
  const vendorData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      const key = e.vendor || e.categoryLabel
      map.set(key, (map.get(key) ?? 0) + e.amountCents / 100)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [expenses])

  // Totals
  const totalIncome = incomeEntries.reduce((s, e) => s + e.amountCents, 0)
  const totalSpend = expenses.reduce((s, e) => s + e.amountCents, 0)
  const totalDeductible = expenses.filter(e => e.isDeductible).reduce((s, e) => s + e.amountCents, 0)

  const PIE_COLORS = ['#00D4AA', '#3B82F6', '#A855F7', '#F5A623', '#E53E3E', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6', '#EF4444']

  const tabs = [
    { id: 'spend',      label: 'Spend by Bucket', icon: BarChart2 },
    { id: 'income',     label: 'Income vs Spend',  icon: TrendingUp },
    { id: 'categories', label: 'Categories',       icon: PieIcon },
    { id: 'deductible', label: 'Tax Deductibles',  icon: CreditCard },
  ] as const

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 size={18} className="text-accent" /> Analytics
        </h1>
        <p className="text-xs text-muted mt-0.5">Last 12 months</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: formatZAR(totalIncome), color: 'text-gold' },
          { label: 'Total Spend', value: formatZAR(totalSpend), color: 'text-white' },
          { label: 'Net Position', value: formatZAR(totalIncome - totalSpend), color: totalIncome >= totalSpend ? 'text-accent' : 'text-danger' },
          { label: 'Deductible Spend', value: formatZAR(totalDeductible), color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] text-muted">{s.label}</p>
            <p className={`text-lg font-bold font-mono mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveChart(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${activeChart === t.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted border border-transparent hover:text-white'}`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-surface border border-border rounded-2xl p-5">

        {activeChart === 'spend' && (
          <div>
            <p className="text-sm font-semibold text-white mb-4">Monthly Spend by Bucket</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E45" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={zarTick} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatZAR(v * 100)} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6B7280' }} />
                <Bar dataKey="needs" name="Needs" fill={COLORS.needs} radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="wants" name="Wants" fill={COLORS.wants} radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="savings" name="Savings" fill={COLORS.savings} radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'income' && (
          <div>
            <p className="text-sm font-semibold text-white mb-4">Income vs Total Spend (Monthly)</p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.income} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS.income} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.tax} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS.tax} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E45" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={zarTick} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatZAR(v * 100)} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6B7280' }} />
                <Area type="monotone" dataKey="income" name="Income" stroke={COLORS.income} fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="total" name="Total Spend" stroke={COLORS.tax} fill="url(#spendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold text-white mb-4">Top Categories (All Time)</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                    paddingAngle={2} dataKey="value"
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#2E2E45' }}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatZAR(v * 100)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {categoryData.slice(0, 10).map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-muted flex-1 truncate">{c.name}</span>
                  <span className="text-xs font-mono text-white">{formatZAR(c.value * 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeChart === 'deductible' && (
          <div>
            <p className="text-sm font-semibold text-white mb-4">Deductible vs Non-Deductible Spend</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={deductibleData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E45" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={zarTick} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatZAR(v * 100)} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6B7280' }} />
                <Bar dataKey="deductible" name="Deductible" fill={COLORS.savings} radius={[3, 3, 0, 0]} />
                <Bar dataKey="nonDeductible" name="Non-Deductible" fill="#2E2E45" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Vendor breakdown */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Top Vendors / Categories by Spend</p>
        <div className="space-y-2">
          {vendorData.map((v, i) => {
            const maxVal = vendorData[0]?.value ?? 1
            return (
              <div key={v.name} className="flex items-center gap-3">
                <span className="text-[10px] text-muted w-5 text-right">{i + 1}</span>
                <span className="text-xs text-white w-36 truncate">{v.name}</span>
                <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(v.value / maxVal) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-white shrink-0">{formatZAR(v.value * 100)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
