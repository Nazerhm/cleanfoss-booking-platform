// Grid of addon cards for service selection

import React from 'react';
import { ProductBooking } from '../lib/types';
import AddonCard from './AddonCard';

interface AddonsGridProps {
  productBooking: ProductBooking;
  onAddonToggle: (addonId: string) => void;
  onQuantityChange: (addonId: string, quantity: number) => void;
  className?: string;
}

export default function AddonsGrid({
  productBooking,
  onAddonToggle,
  onQuantityChange,
  className = ''
}: AddonsGridProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vælg tilvalg
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productBooking.addons.map((addonSelection) => (
          <AddonCard
            key={addonSelection.addon.id}
            addonSelection={addonSelection}
            onToggle={() => onAddonToggle(addonSelection.addon.id)}
            onQuantityChange={(quantity) => onQuantityChange(addonSelection.addon.id, quantity)}
          />
        ))}
      </div>
    </div>
  );
}
