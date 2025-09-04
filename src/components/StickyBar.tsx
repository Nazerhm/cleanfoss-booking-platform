// Sticky bottom bar for mobile view

import React from 'react';
import { PricingSummary } from '../lib/types';
import { formatDKK } from '../lib/format';

interface StickyBarProps {
  pricing: PricingSummary;
  onSubmit: (e?: React.FormEvent) => void;
  disabled?: boolean;
  className?: string;
}

export default function StickyBar({
  pricing,
  onSubmit,
  disabled = false,
  className = ''
}: StickyBarProps) {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4
      safe-area-inset-bottom
      ${className}
    `}>
      <div className="flex items-center justify-between gap-4">
        {/* Total price */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">I alt</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatDKK(pricing.total)}
          </span>
        </div>
        
        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={disabled}
          className="
            flex-1 max-w-xs h-12 bg-cleanfoss-blue hover:bg-blue-700 text-white font-semibold rounded-xl
            transition-colors duration-200 opacity-100 visible
            focus:outline-none focus:ring-2 focus:ring-cleanfoss-blue focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm
          "
        >
          Bestil nu
        </button>
      </div>
    </div>
  );
}
