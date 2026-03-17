"use client";

import React, { useState, useEffect } from "react";

// ── TYPES ─────────────────────────────
type Loan = {
  id: number;
  name: string;
  type: "TRS" | "3-month" | "6-month" | "Other";
  monthlyAmount: number;
  termMonths?: number;
  interestRate?: number;
  paymentDay?: number;
  recurring?: boolean;
  active: boolean;
  startDate?: string;
};

type Transaction = {
  id: number;
  date: string;
  amount: number; // negative = expense
  category: string;
  note?: string;
  receipt?: string; // base64 image
};

// ── SOUTH AFRICA REALISTIC BUCKETS ─────────────────────────────
const SA_BUCKETS: Record<string, number> = {
  Housing: 30,
  Utilities: 10,
  "Food/Groceries": 12,
  Transportation: 12,
  Insurance: 8,
  "Debt Minimums": 8,
  "Home Maintenance": 5,
  "Personal Care": 3,
  "Parent Buffer": 2,
  "Child Education": 6,
  "Child Clothing": 4,
  "Child Health": 2,
  Entertainment: 8,
  Travel: 5,
  Gifts: 3,
  "Emergency Fund": 5,
  Retirement: 5,
  "Future Goals": 3,
  Buffer: 4,
};

export default function PrivateBudget() {
  const HOURLY_RATE = 110;
  const today = new Date();
  const currentDay = today.getDate();

  // ── STATE ────────────────────────────
  const [data, setData] = useState({
    month: today.toISOString().slice(0, 7),
    hours: 180,
    gross: null as number | null,
    loans: [] as Loan[],
    transactions: [] as Transaction[],
  });

  const [loanForm, setLoanForm] = useState({
    name: "",
    type: "Other" as Loan["type"],
    monthlyAmount: 0,
    termMonths: 1,
    interestRate: 0.025,
    paymentDay: 25,
    recurring: false,
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    category: "Housing",
    note: "",
    receipt: null as File | null,
  });

  const [whatIf, setWhatIf] = useState({ amount: 0, category: "Entertainment" });
  const [whatIfResult, setWhatIfResult] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kaydenBudgetData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kaydenBudgetData", JSON.stringify(data));
  }, [data]);

  // ── CALCULATIONS ─────────────────────
  const totalMonthlyLoans = data.loans
    .filter((l) => l.active)
    .reduce((sum, l) => sum + l.monthlyAmount, 0);

  const disposable = data.gross ? Math.max(0, data.gross - totalMonthlyLoans) : 0;

  const categorySpent: Record<string, number> = {};
  Object.keys(SA_BUCKETS).forEach((cat) => {
    categorySpent[cat] = data.transactions
      .filter((t) => t.category === cat && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  // ── ACTIONS ──────────────────────────
  const calculateIncome = () => {
    const gross = Math.round(data.hours * HOURLY_RATE);
    setData((prev) => ({ ...prev, gross }));
  };

  const addLoan = () => {
    if (!loanForm.name || loanForm.monthlyAmount <= 0) {
      alert("Please enter loan name and monthly amount");
      return;
    }

    const newLoan: Loan = {
      id: Date.now(),
      name: loanForm.name,
      type: loanForm.type,
      monthlyAmount: loanForm.monthlyAmount,
      termMonths: loanForm.termMonths,
      interestRate: loanForm.interestRate,
      paymentDay: loanForm.paymentDay,
      recurring: loanForm.recurring,
      active: true,
      startDate: today.toISOString(),
    };

    setData((prev) => ({ ...prev, loans: [...prev.loans, newLoan] }));
    setLoanForm({ name: "", type: "Other", monthlyAmount: 0, termMonths: 1, interestRate: 0.025, paymentDay: 25, recurring: false });
  };

  const removeLoan = (id: number) => {
    if (!confirm("Remove this loan permanently?")) return;
    setData((prev) => ({ ...prev, loans: prev.loans.filter((l) => l.id !== id) }));
  };

  const addExpense = async () => {
    if (expenseForm.amount <= 0) return alert("Enter a valid amount");

    let receiptBase64: string | undefined = undefined;
    if (expenseForm.receipt) {
      receiptBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(expenseForm.receipt!);
      });
    }

    const newTx: Transaction = {
      id: Date.now(),
      date: today.toLocaleDateString("en-ZA"),
      amount: -expenseForm.amount,
      category: expenseForm.category,
      note: expenseForm.note.trim() || undefined,
      receipt: receiptBase64,
    };

    setData((prev) => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    setExpenseForm({ amount: 0, category: "Housing", note: "", receipt: null });
  };

  const removeTransaction = (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    setData((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
  };

  const runWhatIf = () => {
    if (whatIf.amount <= 0) return;
    const spent = (categorySpent[whatIf.category] || 0) + whatIf.amount;
    const target = Math.round(disposable * (SA_BUCKETS[whatIf.category] / 100));
    const remaining = target - spent;

    let msg = `If you spend R${whatIf.amount} on ${whatIf.category} now:\n\n`;
    msg += `Bucket remaining: R${remaining.toLocaleString()}\n`;
    if (remaining < 0) msg += `⚠️ OVER by R${Math.abs(remaining).toLocaleString()}`;
    else if (remaining < target * 0.25) msg += "⚠️ Getting low – be careful!";
    setWhatIfResult(msg);
  };

  const startNewMonth = () => {
    if (!confirm("Start a new month? This will clear transactions but keep recurring loans.")) return;
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    setData((prev) => ({
      month: nextMonth.toISOString().slice(0, 7),
      hours: 180,
      gross: null,
      loans: prev.loans.filter((l) => l.recurring),
      transactions: [],
    }));
  };

  // Auto interest alert on payment day
  data.loans.forEach((loan) => {
    if (loan.active && loan.paymentDay === currentDay && loan.interestRate) {
      const interest = Math.round((loan.remainingBalance || loan.monthlyAmount) * loan.interestRate);
      if (interest > 0) {
        alert(`Payment day alert!\n\n${loan.name} (${loan.type})\nInterest due today: R${interest}`);
      }
    }
  });

  // ── RENDER ───────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-emerald-400">Kayden's Private Budget Tracker</h1>

        {/* INCOME SETUP */}
        <section className="bg-zinc-900 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6">Monthly Income Setup</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-2">Expected hours this month</label>
              <input
                type="number"
                value={data.hours}
                onChange={(e) => setData((p) => ({ ...p, hours: Number(e.target.value) || 180 }))}
                className="w-full bg-zinc-800 rounded-2xl px-6 py-5 text-3xl font-medium"
              />
            </div>
            <button
              onClick={calculateIncome}
              className="bg-emerald-600 hover:bg-emerald-500 px-12 py-5 rounded-2xl text-lg font-semibold self-end md:self-auto"
            >
              Calculate & Lock
            </button>
          </div>

          {data.gross && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-800 p-6 rounded-2xl text-center">
                <p className="text-zinc-400">Gross Income</p>
                <p className="text-4xl font-mono text-emerald-400">R{data.gross.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 p-6 rounded-2xl text-center">
                <p className="text-zinc-400">Loans (deducted first)</p>
                <p className="text-4xl font-mono text-red-400">-R{totalMonthlyLoans.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-900/60 p-6 rounded-2xl text-center border border-emerald-500">
                <p className="text-emerald-300 font-semibold">DISPOSABLE INCOME</p>
                <p className="text-5xl font-bold text-emerald-400">R{disposable.toLocaleString()}</p>
              </div>
            </div>
          )}

          <button
            onClick={startNewMonth}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-lg font-medium"
          >
            Start New Month
          </button>
        </section>

        {/* LOANS */}
        <section className="bg-zinc-900 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6">Loans & Recurring Debits</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-950 p-6 rounded-2xl mb-8">
            <input type="text" placeholder="Loan name" value={loanForm.name} onChange={(e) => setLoanForm(p => ({...p, name: e.target.value}))} className="bg-zinc-800 rounded-2xl px-5 py-4" />
            <input type="number" placeholder="Monthly amount (R)" value={loanForm.monthlyAmount || ""} onChange={(e) => setLoanForm(p => ({...p, monthlyAmount: Number(e.target.value)}))} className="bg-zinc-800 rounded-2xl px-5 py-4" />
            <select value={loanForm.type} onChange={(e) => setLoanForm(p => ({...p, type: e.target.value as Loan["type"]}))} className="bg-zinc-800 rounded-2xl px-5 py-4">
              <option value="TRS">TRS (1-month)</option>
              <option value="3-month">3-month</option>
              <option value="6-month">6-month</option>
              <option value="Other">Other</option>
            </select>
            <input type="number" placeholder="Term (months)" value={loanForm.termMonths} onChange={(e) => setLoanForm(p => ({...p, termMonths: Number(e.target.value)}))} className="bg-zinc-800 rounded-2xl px-5 py-4" />
            <input type="number" step="0.001" placeholder="Interest rate (e.g. 0.025)" value={loanForm.interestRate} onChange={(e) => setLoanForm(p => ({...p, interestRate: Number(e.target.value)}))} className="bg-zinc-800 rounded-2xl px-5 py-4" />
            <button onClick={addLoan} className="bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-semibold lg:col-span-3">Add Loan</button>
          </div>

          {data.loans.map((loan) => (
            <div key={loan.id} className="flex justify-between items-center bg-zinc-800 p-5 rounded-2xl mb-4">
              <div>
                <span className="font-medium text-lg">{loan.name}</span>
                <span className="ml-4 text-sm text-zinc-500">
                  {loan.type} • {loan.termMonths} mo • Day {loan.paymentDay}
                </span>
              </div>
              <div className="flex items-center gap-8">
                <span className="font-mono text-red-400 text-xl">-R{loan.monthlyAmount}</span>
                <button onClick={() => removeLoan(loan.id)} className="text-3xl text-red-500 hover:text-red-400">×</button>
              </div>
            </div>
          ))}
        </section>

        {/* WHAT-IF SIMULATOR */}
        <section className="bg-zinc-900 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6">What-If Simulator</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              placeholder="R150"
              value={whatIf.amount || ""}
              onChange={(e) => setWhatIf(p => ({...p, amount: Number(e.target.value)}))}
              className="bg-zinc-800 rounded-2xl px-6 py-5 flex-1 text-xl"
            />
            <select
              value={whatIf.category}
              onChange={(e) => setWhatIf(p => ({...p, category: e.target.value}))}
              className="bg-zinc-800 rounded-2xl px-6 py-5 text-lg"
            >
              {Object.keys(SA_BUCKETS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={runWhatIf} className="bg-yellow-500 hover:bg-yellow-400 px-10 py-5 rounded-2xl font-semibold">Simulate</button>
          </div>
          {whatIfResult && (
            <div className="mt-6 p-6 bg-zinc-950 border border-yellow-500 rounded-2xl text-lg whitespace-pre-line">
              {whatIfResult}
            </div>
          )}
        </section>

        {/* BUCKETS */}
        <section className="bg-zinc-900 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-8">Budget Buckets (After Loans)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(SA_BUCKETS).map(([cat, percent]) => {
              const target = Math.round(disposable * (percent / 100));
              const spent = categorySpent[cat] || 0;
              const remaining = target - spent;
              const pctUsed = target > 0 ? (spent / target) * 100 : 0;
              const barColor = pctUsed > 100 ? "bg-red-600" : pctUsed > 75 ? "bg-yellow-500" : "bg-emerald-500";

              return (
                <div key={cat} className="bg-zinc-800 p-6 rounded-2xl">
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">{cat}</span>
                    <span className="font-mono">R{spent} / R{target}</span>
                  </div>
                  <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all`} style={{ width: `${Math.min(pctUsed, 120)}%` }} />
                  </div>
                  <div className="text-xs mt-3 text-right">
                    {remaining >= 0 ? `R${remaining} left` : `Over by R${Math.abs(remaining)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ADD EXPENSE + RECEIPT */}
        <section className="bg-zinc-900 rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Add Expense + Receipt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="number"
              placeholder="Amount (R)"
              value={expenseForm.amount || ""}
              onChange={(e) => setExpenseForm(p => ({...p, amount: Number(e.target.value)}))}
              className="bg-zinc-800 rounded-2xl px-6 py-5"
            />
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm(p => ({...p, category: e.target.value}))}
              className="bg-zinc-800 rounded-2xl px-6 py-5"
            >
              {Object.keys(SA_BUCKETS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Note"
              value={expenseForm.note}
              onChange={(e) => setExpenseForm(p => ({...p, note: e.target.value}))}
              className="bg-zinc-800 rounded-2xl px-6 py-5"
            />
          </div>

          <div className="mt-8">
            <label className="block text-sm text-zinc-400 mb-3">Receipt Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setExpenseForm(p => ({...p, receipt: e.target.files?.[0] || null}))}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:bg-emerald-600 file:text-white"
            />
          </div>

          <button
            onClick={addExpense}
            className="mt-10 w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-3xl text-xl font-semibold"
          >
            Add Expense
          </button>
        </section>

        {/* TRANSACTIONS */}
        <section className="mt-12 bg-zinc-900 rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Transactions</h2>
          {data.transactions.length === 0 ? (
            <p className="text-zinc-500">No transactions yet.</p>
          ) : (
            data.transactions.map((tx) => (
              <div key={tx.id} className="bg-zinc-800 p-6 rounded-2xl mb-6 flex justify-between items-start">
                <div>
                  <div className="text-emerald-400">{tx.date} • {tx.category}</div>
                  {tx.note && <div className="text-zinc-400 mt-1">{tx.note}</div>}
                  {tx.receipt && (
                    <img src={tx.receipt} alt="receipt" className="mt-4 max-w-[220px] rounded-xl border border-zinc-700" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono text-red-400 text-2xl">-R{Math.abs(tx.amount)}</div>
                  <button onClick={() => removeTransaction(tx.id)} className="text-red-500 text-4xl mt-2">×</button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}