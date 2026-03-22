/* src/components/modals/AddBonusModal.tsx */
'use client';

import { useState } from 'react';
import { addBonusAction } from '@/app/actions/bonus';

export default function AddBonusModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('description', description);

    const res = await addBonusAction(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setOpen(false);
      setAmount('');
      setDescription('');
      window.location.reload(); // crude refresh for MVP — we'll use revalidatePath later
    }
    setLoading(false);
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Add Bonus</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (ZAR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                  placeholder="e.g. Extra client payment March"
                />
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Bonus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}