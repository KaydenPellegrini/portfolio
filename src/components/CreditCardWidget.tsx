/* src/components/CreditCardWidget.tsx */
'use client';

import { formatZAR } from '@/lib/format';
import { ICreditCard } from '@/models/CreditCard';

interface CreditCardWidgetProps {
  card: ICreditCard;
}

export default function CreditCardWidget({ card }: CreditCardWidgetProps) {
  const utilisation = card.limit > 0 ? (card.balance / card.limit) * 100 : 0;
  const isHigh = utilisation > 70;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{card.name}</h4>
          <p className="text-xs text-gray-400">{card.type === 'store' ? card.store : 'General'}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-gray-700">
          {formatZAR(card.balance)} / {formatZAR(card.limit)}
        </span>
      </div>

      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isHigh ? 'bg-red-500' : 'bg-yellow-500'}`}
            style={{ width: `${utilisation}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {utilisation.toFixed(1)}% utilised
        </p>
      </div>

      {card.minPayment > 0 && (
        <p className="text-xs mt-2 text-red-300">
          Min payment due: {formatZAR(card.minPayment)}
        </p>
      )}
    </div>
  );
}