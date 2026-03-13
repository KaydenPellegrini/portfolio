<>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Private Budget</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        "\n    body { font-family: system-ui, sans-serif; }\n    .bucket { transition: all 0.3s; }\n  "
    }}
  />
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-center mb-8 text-emerald-400">
      Kayden's Private Budget Tracker
    </h1>
    {/* MONTHLY SETUP */}
    <div className="bg-zinc-900 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        1. Monthly Income Setup (1 week before payday)
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Expected hours this month
          </label>
          <input
            id="hours"
            type="number"
            defaultValue={180}
            className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-lg"
          />
        </div>
        <div>
          <button
            onclick="calculateIncome()"
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-medium"
          >
            Calculate &amp; Lock Budget
          </button>
        </div>
      </div>
      <div id="incomeSummary" className="mt-6 text-sm hidden">
        <p>
          Gross: <span id="gross" className="font-mono text-emerald-400" />
        </p>
        <p className="text-zinc-400">
          Tax = 0% (company expenses) → Net = Gross
        </p>
        <p id="disposable" className="text-lg font-semibold" />
      </div>
    </div>
    {/* LOANS / DEBTS FIRST (always subtracted) */}
    <div className="bg-zinc-900 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Active Loans / Debts (auto-subtracted first)
      </h2>
      <div id="loansList" className="space-y-3" />
      <button onclick="addLoan()" className="text-emerald-400 text-sm mt-3">
        + Add new loan
      </button>
    </div>
    {/* BUDGET BUCKETS */}
    <div className="bg-zinc-900 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Your Spending Buckets (after loans)
      </h2>
      <div id="buckets" className="grid grid-cols-2 gap-4" />
    </div>
    {/* QUICK ADD EXPENSE */}
    <div className="bg-zinc-900 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Quick Add Expense (e.g. McDonald's craving)
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <input
          id="amount"
          type="number"
          placeholder="R150"
          className="bg-zinc-800 rounded-lg px-4 py-3"
        />
        <select id="category" className="bg-zinc-800 rounded-lg px-4 py-3">
          <option value="Fuel">Fuel / Petrol</option>
          <option value="Takeouts">Takeouts (McDonald's etc)</option>
          <option value="Groceries">Groceries</option>
          <option value="OnlinePurchases">Online Personal Purchases</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        <button
          onclick="addExpense()"
          className="bg-emerald-600 hover:bg-emerald-500 rounded-lg"
        >
          Add Now
        </button>
      </div>
      <input
        id="note"
        type="text"
        placeholder="McDonald's burger"
        className="w-full mt-3 bg-zinc-800 rounded-lg px-4 py-3"
      />
    </div>
    {/* TRANSACTIONS */}
    <div className="bg-zinc-900 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">This Month's Transactions</h2>
      <div id="transactions" className="space-y-2 text-sm" />
    </div>
  </div>
</>
