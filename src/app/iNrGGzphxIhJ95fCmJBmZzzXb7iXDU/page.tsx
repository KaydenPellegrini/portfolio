"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from './page.module.css';
// ─── CONFIG ─────────────────────────────
const HOURLY_RATE = 110;

// Simplified categories (UI)
const CATEGORIES = ["Needs", "Wants", "Savings"];

// Internal smart allocation
const CATEGORY_SPLIT = {
  Needs: 50,
  Wants: 30,
  Savings: 20,
};

// ─── TYPES ─────────────────────────────
type Loan = {
  id: number;
  name: string;
  remaining: number;
  payment: number;
  interest: number;
  active: boolean;
};

type Tx = {
  id: number;
  amount: number;
  category: string;
  note?: string;
  receipt?: string;
  date: string;
};

export default function BudgetApp() {
  const [mounted, setMounted] = useState(false);

  const [data, setData] = useState({
    hours: 180,
    loans: [] as Loan[],
    transactions: [] as Tx[],
    incomes: [] as number[],
  });

  const [notifications, setNotifications] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [expense, setExpense] = useState({
    amount: 0,
    category: "Needs",
    note: "",
    receipt: null as File | null,
  });

  const [loanForm, setLoanForm] = useState({
    name: "",
    amount: 0,
    payment: 0,
  });

  const [bonus, setBonus] = useState(0);

  const notify = (msg: string) => {
    setNotifications((p) => [...p, msg]);
    setTimeout(() => setNotifications((p) => p.slice(1)), 3000);
  };

  // ─── HYDRATION FIX ─────────────────────────────
  useEffect(() => setMounted(true), []);

  // ─── LOAD ─────────────────────────────
  useEffect(() => {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((d) => d && setData((p) => ({ ...p, ...d })));
  }, []);

  // ─── SAVE ─────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const { _id, ...clean } = data as any;

    fetch("/api/budget", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  }, [data, mounted]);

  // ─── CALCULATIONS ─────────────────────────────
  const base = useMemo(() => data.hours * HOURLY_RATE, [data.hours]);
  const bonusIncome = useMemo(() => data.incomes.reduce((a, b) => a + b, 0), [data.incomes]);
  const totalIncome = base + bonusIncome;

  const spentByCategory = useMemo(() => {
    const map: any = {};
    CATEGORIES.forEach((c) => (map[c] = 0));
    data.transactions.forEach((t) => {
      map[t.category] += Math.abs(t.amount);
    });
    return map;
  }, [data.transactions]);

  const totalSpent = Object.values(spentByCategory).reduce((a: any, b: any) => a + b, 0);

  const budgets = useMemo(() => {
    const obj: any = {};
    CATEGORIES.forEach((c) => {
      obj[c] = (CATEGORY_SPLIT[c as keyof typeof CATEGORY_SPLIT] / 100) * totalIncome;
    });
    return obj;
  }, [totalIncome]);

  // ─── ACTIONS ─────────────────────────────
  const addExpense = async () => {
    if (expense.amount <= 0) return;

    let receipt;
    if (expense.receipt) {
      receipt = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target?.result as string);
        r.readAsDataURL(expense.receipt!);
      });
    }

    setData((p) => ({
      ...p,
      transactions: [
        {
          id: Date.now(),
          amount: -expense.amount,
          category: expense.category,
          note: expense.note,
          receipt,
          date: new Date().toLocaleDateString("en-ZA"),
        },
        ...p.transactions,
      ],
    }));

    notify("Expense added");
  };

  const addLoan = () => {
    if (!loanForm.name) return;

    setData((p) => ({
      ...p,
      loans: [
        ...p.loans,
        {
          id: Date.now(),
          name: loanForm.name,
          remaining: loanForm.amount,
          payment: loanForm.payment,
          interest: 0.02,
          active: true,
        },
      ],
    }));

    notify("Loan added");
  };

  const applyLoans = () => {
    setData((p) => ({
      ...p,
      loans: p.loans.map((l) => {
        if (!l.active) return l;

        let balance = l.remaining;
        balance += balance * l.interest;
        balance -= l.payment;

        if (balance <= 0) {
          notify(`${l.name} paid off 🎉`);
          return { ...l, remaining: 0, active: false };
        }

        return { ...l, remaining: balance };
      }),
    }));
  };

  const addBonus = () => {
    if (bonus <= 0) return;
    setData((p) => ({ ...p, incomes: [...p.incomes, bonus] }));
    notify("Bonus added");
  };

  if (!mounted) return null;

  // ─── UI ─────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b0b12] text-white p-6">
      <h1 className="text-4xl font-bold text-emerald-400 mb-6">Budget System</h1>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="bg-purple-600 px-4 py-2 rounded-xl shadow-lg">
            {n}
          </div>
        ))}
      </div>

      {/* Income Card */}
      <div className="bg-zinc-900 p-6 rounded-3xl mb-6 shadow-lg">
        <p>Base: R{base.toLocaleString("en-ZA")}</p>
        <p>Bonus: R{bonusIncome.toLocaleString("en-ZA")}</p>
        <p className="text-emerald-400 font-bold text-lg">
          Total: R{totalIncome.toLocaleString("en-ZA")}
        </p>

        <input
          type="number"
          value={bonus}
          onChange={(e) => setBonus(Number(e.target.value))}
          className="mt-2 px-3 py-2 rounded-xl text-black"
        />
        <button onClick={addBonus} className="ml-2 bg-teal-500 px-3 py-2 rounded-xl">
          Add Bonus
        </button>
      </div>

      {/* Budget Bars */}
      <div className="bg-zinc-900 p-6 rounded-3xl mb-6">
        {CATEGORIES.map((c) => {
          const spent = spentByCategory[c];
          const max = budgets[c] || 1;
          const percent = Math.min((spent / max) * 100, 100);

          return (
            <div key={c} className="mb-4">
              <div className="flex justify-between text-sm">
                <span>{c}</span>
                <span>R{spent.toFixed(0)} / R{max.toFixed(0)}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    percent > 100 ? "bg-red-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Loans */}
      <div className="bg-zinc-900 p-6 rounded-3xl mb-6">
        <h2 className="mb-3">Loans</h2>

        {data.loans.map((l) => (
          <div key={l.id} className="bg-zinc-800 p-3 mb-2 rounded-xl">
            {l.name} — R{l.remaining.toFixed(0)}
          </div>
        ))}

        <button onClick={applyLoans} className="bg-purple-600 px-3 py-2 rounded-xl mb-3">
          Apply Monthly Update
        </button>

        <input placeholder="Name" onChange={(e) => setLoanForm((p) => ({ ...p, name: e.target.value }))} className="text-black p-2 mr-2"/>
        <input type="number" placeholder="Amount" onChange={(e) => setLoanForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="text-black p-2 mr-2"/>
        <input type="number" placeholder="Payment" onChange={(e) => setLoanForm((p) => ({ ...p, payment: Number(e.target.value) }))} className="text-black p-2 mr-2"/>
        <button onClick={addLoan} className="bg-purple-600 px-3 py-2 rounded-xl">Add</button>
      </div>

      {/* Expense */}
      <div className="bg-zinc-900 p-6 rounded-3xl mb-6">
        <input type="number" onChange={(e) => setExpense((p) => ({ ...p, amount: Number(e.target.value) }))} className="text-black p-2 mr-2"/>
        <select onChange={(e) => setExpense((p) => ({ ...p, category: e.target.value }))} className="text-black p-2 mr-2">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Note" onChange={(e) => setExpense((p) => ({ ...p, note: e.target.value }))} className="text-black p-2 mr-2"/>
        <input type="file" onChange={(e) => setExpense((p) => ({ ...p, receipt: e.target.files?.[0] || null }))}/>
        <button onClick={addExpense} className="bg-purple-600 px-3 py-2 rounded-xl ml-2">Add</button>
      </div>

      {/* Transactions */}
      <div className="bg-zinc-900 p-6 rounded-3xl">
        <input placeholder="Search" onChange={(e) => setSearch(e.target.value)} className="text-black p-2 mb-3"/>

        {data.transactions
          .filter((t) => t.category.toLowerCase().includes(search.toLowerCase()))
          .map((t) => (
            <div key={t.id} className="bg-zinc-800 p-3 mb-2 rounded-xl">
              <div>{t.date} • {t.category}</div>
              <div>R{Math.abs(t.amount)}</div>
              {t.receipt && <img src={t.receipt} className="mt-2 w-24 rounded" />}
            </div>
          ))}
      </div>
    </div>
  );
}