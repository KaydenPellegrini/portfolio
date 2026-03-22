/* app/(hidden)/page.tsx */
import { connectDB } from '@/lib/db';
import { Settings } from '@/models/Settings';
import { Bonus } from '@/models/Bonus';
import { Expense } from '@/models/Expense';
import { CreditCard } from '@/models/CreditCard';
import { RecurringExpense } from '@/models/RecurringExpense';

import { formatZAR } from '@/lib/format';
import BucketCard from '@/components/BucketCard';
import CreditCardWidget from '@/components/CreditCardWidget';
import RecentExpenses from '@/components/RecentExpenses';
import AddBonusModal from '@/components/modals/AddBonusModal';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import AddRecurringModal from '@/components/modals/AddRecurringModal';

export const dynamic = 'force-dynamic'; // always fresh data on dashboard

export default async function Dashboard() {
  await connectDB(); // must call on every server render/action

  // Fetch settings (assume single doc, _id doesn't matter)
  const settings = await Settings.findOne().lean() || {
    baseIncome: 0,
    bucketBudgets: { needs: 9900, wants: 5940, savings: 3960 },
  };

  // Bonuses this month (rough — we can add period filtering later)
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const bonuses = await Bonus.find({ date: { $gte: thisMonth } }).lean();
  const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

  const totalIncome = settings.baseIncome + totalBonus;

  // Bucket spends
  const expenses = await Expense.find({}).lean();
  const spends = {
    Needs: expenses.filter(e => e.bucket === 'Needs').reduce((sum, e) => sum + e.amount, 0),
    Wants: expenses.filter(e => e.bucket === 'Wants').reduce((sum, e) => sum + e.amount, 0),
    Savings: expenses.filter(e => e.bucket === 'Savings').reduce((sum, e) => sum + e.amount, 0),
  };

  const buckets = [
    { name: 'Needs', spent: spends.Needs, budget: settings.bucketBudgets.needs },
    { name: 'Wants', spent: spends.Wants, budget: settings.bucketBudgets.wants },
    { name: 'Savings', spent: spends.Savings, budget: settings.bucketBudgets.savings },
  ];

  // Recent expenses
  const recentExpenses = await Expense.find({})
    .sort({ date: -1 })
    .limit(10)
    .populate('creditCard', 'name')
    .lean();

  // Credit cards
  const creditCards = await CreditCard.find({}).lean();

  // Upcoming recurring (next 7 days)
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const upcomingRecurring = await RecurringExpense.find({
    isActive: true,
    nextDue: { $lte: soon },
  }).sort({ nextDue: 1 }).limit(5).lean();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header - preserve exact text */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold">
          Kayden Pellegrini | Power BI & Full-Stack Developer
        </h1>
        <p className="text-xl text-gray-400 mt-1"># Budget System</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Card */}
        <div className="lg:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Income</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400">Base CTC</p>
              <p className="text-3xl font-bold">{formatZAR(settings.baseIncome)}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-2">
                Bonus
                <AddBonusModal trigger={<button className="text-sm text-blue-400 hover:underline">Add Bonus</button>} />
              </p>
              <p className="text-3xl font-bold">{formatZAR(totalBonus)}</p>
            </div>
            <div>
              <p className="text-gray-400">Total</p>
              <p className="text-3xl font-bold text-green-400">{formatZAR(totalIncome)}</p>
            </div>
          </div>
        </div>

        {/* Bucket Cards */}
        {buckets.map(bucket => (
          <BucketCard
            key={bucket.name}
            name={bucket.name}
            spent={bucket.spent}
            budget={bucket.budget}
          />
        ))}

        {/* Quick Actions */}
        <div className="lg:col-span-3 flex flex-wrap gap-4 my-6">
          <AddExpenseModal />
          <AddRecurringModal />
          {/* More quick buttons later: Add Credit Card, etc. */}
        </div>

        {/* Credit Cards Widget */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Credit Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map(card => (
              <CreditCardWidget key={card._id.toString()} card={card} />
            ))}
            {creditCards.length === 0 && (
              <p className="text-gray-500">No cards yet — add your Woolies/Edgars/RCS first</p>
            )}
          </div>
        </div>

        {/* Upcoming Recurring */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Upcoming Recurring</h2>
          {upcomingRecurring.length > 0 ? (
            <ul className="space-y-3">
              {upcomingRecurring.map(r => (
                <li key={r._id.toString()} className="flex justify-between text-sm">
                  <span>{r.description}</span>
                  <span className="text-red-400">{formatZAR(r.amount)} • {new Date(r.nextDue).toLocaleDateString('en-ZA')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Nothing due soon. Good.</p>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Recent Expenses</h2>
          <RecentExpenses expenses={recentExpenses} />
        </div>
      </div>
    </div>
  );
}