// Quantity stepper component for addons like "Dybdegående sæderens"

import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QtyStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function QtyStepper({
  value,
  min,
  max,
  onChange,
  disabled = false,
  className = ''
}: QtyStepperProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex items-center border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-label="Reducer antal"
      >
        <MinusIcon className="w-4 h-4 text-gray-600" />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-12 h-10 text-center text-sm font-medium bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset disabled:opacity-50"
        aria-label="Antal"
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-label="Forøg antal"
      >
        <PlusIcon className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
