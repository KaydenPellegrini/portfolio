/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/modals/AddExpenseModal.tsx */
'use client';

import { useState } from 'react';
import { addExpenseAction } from '@/app/actions/expense';

const CATEGORIES = [
  'Groceries', 'Fuel', 'Subscriptions', 'Software/Tools', 'Home Office',
  'Dining Out', 'Luxury Clothing', 'Entertainment', 'Advertising', 'Travel',
  'Utilities', 'Rent/Mortgage', 'Insurance', 'Medical', 'Education',
  // Add more as needed
];

const REQUIRES_RECEIPT = [
  'Fuel', 'Dining Out', 'Luxury Clothing', 'Entertainment', 'Travel',
  // extend for Wants/luxury/leisure
];

export default function AddExpenseModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: '',
    bucket: 'Needs' as 'Needs' | 'Wants' | 'Savings',
    description: '',
    paymentMethod: 'Debit' as 'Cash' | 'Debit' | 'Credit Card' | 'Store Card',
    creditCardId: '',
    isDeductible: false,
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const needsReceipt = REQUIRES_RECEIPT.includes(form.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsReceipt && !receipt) {
      setError('Receipt required for this category (Wants/Fuel/Luxury/etc.)');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('amount', form.amount);
    formData.append('date', form.date);
    formData.append('category', form.category);
    formData.append('bucket', form.bucket);
    formData.append('description', form.description);
    formData.append('paymentMethod', form.paymentMethod);
    if (form.creditCardId) formData.append('creditCardId', form.creditCardId);
    formData.append('isDeductible', form.isDeductible ? 'true' : 'false');
    if (receipt) formData.append('receipt', receipt);

    const res = await addExpenseAction(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setOpen(false);
      // reset form
      setForm({
        amount: '', date: new Date().toISOString().slice(0, 10), category: '',
        bucket: 'Needs', description: '', paymentMethod: 'Debit',
        creditCardId: '', isDeductible: false,
      });
      setReceipt(null);
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
      >
        + Add Expense
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Add Expense</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (ZAR)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Bucket</label>
                <select
                  value={form.bucket}
                  onChange={(e) => setForm({ ...form, bucket: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                >
                  <option value="Needs">Needs</option>
                  <option value="Wants">Wants</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Debit">Debit</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Store Card">Store Card</option>
                </select>
              </div>

              {(form.paymentMethod === 'Credit Card' || form.paymentMethod === 'Store Card') && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Credit Card</label>
                  <select
                    value={form.creditCardId}
                    onChange={(e) => setForm({ ...form, creditCardId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select card...</option>
                    {/* We'll populate dynamically later with useEffect + fetch */}
                    <option value="placeholder-woolies">Woolworths Card</option>
                    <option value="placeholder-edgars">Edgars</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isDeductible}
                  onChange={(e) => setForm({ ...form, isDeductible: e.target.checked })}
                  className="h-4 w-4 bg-gray-700 border-gray-600"
                />
                <label className="text-sm text-gray-300">Deductible for tax? (business expense)</label>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Receipt {needsReceipt && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
                {needsReceipt && !receipt && (
                  <p className="text-xs text-red-400 mt-1">Mandatory for this category</p>
                )}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}