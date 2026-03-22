/* eslint-disable react/no-unescaped-entities */
/* src/components/RecentExpenses.tsx */
'use client';

import { formatZAR, formatDate } from '@/lib/format';
import { IExpense } from '@/models/Expense';

interface RecentExpensesProps {
  expenses: (IExpense & { creditCard?: { name: string } })[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  if (expenses.length === 0) {
    return <p className="text-gray-500 text-center py-4">No expenses yet — let's change that</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-2 px-3 text-left">Date</th>
            <th className="py-2 px-3 text-left">Desc</th>
            <th className="py-2 px-3 text-right">Amount</th>
            <th className="py-2 px-3 text-left">Bucket</th>
            <th className="py-2 px-3 text-left">Method</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp._id.toString()} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-3 px-3">{formatDate(exp.date)}</td>
              <td className="py-3 px-3">{exp.description}</td>
              <td className="py-3 px-3 text-right font-medium">{formatZAR(exp.amount)}</td>
              <td className="py-3 px-3">{exp.bucket}</td>
              <td className="py-3 px-3">
                {exp.paymentMethod}
                {exp.creditCard && ` (${exp.creditCard.name})`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}