'use client';

import React from 'react';
import { VehicleDetails } from '../lib/types';

interface VehicleDetailsFormProps {
  vehicleDetails: VehicleDetails;
  onVehicleDetailsChange: (vehicleDetails: VehicleDetails) => void;
  className?: string;
}

export default function VehicleDetailsForm({ 
  vehicleDetails, 
  onVehicleDetailsChange, 
  className = '' 
}: VehicleDetailsFormProps) {
  const carBrands = [
    'Audi', 'BMW', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 
    'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 
    'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo', 'Anden'
  ];

  const carSizes = [
    { id: 'mini', name: 'Mini (Smart, Fiat 500)', priceMultiplier: 0.8 },
    { id: 'mellem', name: 'Mellem (Golf, Focus)', priceMultiplier: 1.0 },
    { id: 'sedan', name: 'Sedan (Passat, 3-serie)', priceMultiplier: 1.1 },
    { id: 'stationcar', name: 'Stationcar (V70, Mondeo)', priceMultiplier: 1.2 },
    { id: 'suv', name: 'SUV (X5, Q7)', priceMultiplier: 1.3 },
    { id: 'mmv', name: 'MPV/Minivan (Sharan, Galaxy)', priceMultiplier: 1.3 },
    { id: 'varevogn', name: 'Varevogn (Transit, Sprinter)', priceMultiplier: 1.5 },
  ];

  const handleBrandChange = (brand: string) => {
    onVehicleDetailsChange({ ...vehicleDetails, brand });
  };

  const handleModelChange = (model: string) => {
    onVehicleDetailsChange({ ...vehicleDetails, model });
  };

  const handleSizeChange = (size: VehicleDetails['size']) => {
    onVehicleDetailsChange({ ...vehicleDetails, size });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-md font-medium text-gray-900">
        Biloplysninger
      </h4>
      
      {/* Car Brand */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilmærke
        </label>
        <select
          value={vehicleDetails.brand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue"
        >
          <option value="">Vælg bilmærke</option>
          {carBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Car Model */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilmodel
        </label>
        <input
          type="text"
          value={vehicleDetails.model}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="F.eks. Golf, Focus, A4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue"
        />
      </div>

      {/* Car Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilstørrelse (påvirker prisen)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {carSizes.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => handleSizeChange(size.id as VehicleDetails['size'])}
              className={`
                p-3 text-left rounded-lg border-2 transition-all duration-200
                ${vehicleDetails.size === size.id
                  ? 'border-cleanfoss-blue bg-cleanfoss-blue/5 text-cleanfoss-blue'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-cleanfoss-blue/30'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{size.name}</span>
                {size.priceMultiplier !== 1.0 && (
                  <span className="text-xs text-gray-500">
                    {size.priceMultiplier > 1.0 ? '+' : ''}{Math.round((size.priceMultiplier - 1) * 100)}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
