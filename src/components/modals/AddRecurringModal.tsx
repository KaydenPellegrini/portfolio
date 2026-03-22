/* src/components/modals/AddRecurringModal.tsx */
'use client';

import { useState } from 'react';
// We'll add action later when ready

export default function AddRecurringModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
      >
        + Add Recurring
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Add Recurring Expense</h3>
            <p className="text-gray-400 mb-6">Rent, Netflix, gym, etc. — auto-track upcoming.</p>

            {/* Form skeleton — expand when we hit recurring logic */}
            <div className="space-y-4">
              <input placeholder="Amount" className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2" />
              <input placeholder="Description" className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2" />
              <select className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2">
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200">
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md">
                Save Recurring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}