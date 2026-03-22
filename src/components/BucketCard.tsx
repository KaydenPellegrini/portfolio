/* src/components/BucketCard.tsx */
'use client';

import { formatZAR } from '@/lib/format';

interface BucketCardProps {
  name: string;
  spent: number;
  budget: number;
}

export default function BucketCard({ name, spent, budget }: BucketCardProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOver = spent > budget;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <span className={`text-sm font-medium ${isOver ? 'text-red-400' : 'text-green-400'}`}>
          {formatZAR(remaining)} left
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Spent</span>
          <span>{formatZAR(spent)} / {formatZAR(budget)}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${isOver ? 'bg-red-600' : 'bg-blue-600'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {percentage.toFixed(0)}% used {isOver && '— overspent, bru'}
      </p>
    </div>
  );
}