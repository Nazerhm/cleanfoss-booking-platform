// Individual addon card component

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { AddonSelection } from '../lib/types';
import { formatDKK } from '../lib/format';
import QtyStepper from './QtyStepper';

interface AddonCardProps {
  addonSelection: AddonSelection;
  onToggle: () => void;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}

export default function AddonCard({
  addonSelection,
  onToggle,
  onQuantityChange,
  className = ''
}: AddonCardProps) {
  const { addon, selected, quantity } = addonSelection;
  
  const getPrice = () => {
    if (addon.type === 'quantity' && addon.unitPrice) {
      return addon.unitPrice * quantity;
    }
    return addon.price || 0;
  };

  const getDisplayPrice = () => {
    if (addon.type === 'quantity' && addon.unitPrice) {
      return `${formatDKK(addon.unitPrice)} pr. sæde`;
    }
    return formatDKK(addon.price || 0);
  };

  return (
    <div
      className={`
        relative border rounded-xl p-4 cursor-pointer transition-all duration-200
        ${selected 
          ? 'border-2 border-blue-500 bg-blue-50 shadow-md' 
          : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${className}
      `}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
            ${selected 
              ? 'bg-blue-500 border-blue-500' 
              : 'border-gray-300 bg-white'
            }
          `}
        >
          {selected && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Content */}
      <div className="pr-8">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {addon.name}
        </h3>
        
        {addon.description && (
          <p className="text-xs text-gray-600 mb-2">
            {addon.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Price chip */}
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getDisplayPrice()}
            </span>
            
            {/* Total price for quantity items */}
            {addon.type === 'quantity' && selected && quantity > 1 && (
              <span className="text-xs text-gray-600">
                Total: {formatDKK(getPrice())}
              </span>
            )}
          </div>
        </div>

        {/* Quantity stepper for applicable addons */}
        {addon.type === 'quantity' && selected && (
          <div 
            className="mt-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()} // Prevent card toggle when interacting with stepper
          >
            <span className="text-xs text-gray-600 min-w-0">Antal sæder:</span>
            <QtyStepper
              value={quantity}
              min={addon.min || 1}
              max={addon.max || 7}
              onChange={onQuantityChange}
              className="ml-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
