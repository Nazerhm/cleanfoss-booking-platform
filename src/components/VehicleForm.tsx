'use client';

// Enhanced Vehicle selection form component for car details

import React from 'react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  size: 'mini' | 'mellem' | 'sedan' | 'stationcar' | 'suv' | 'varevogn';
  selected: boolean;
}

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onVehicleChange: (vehicle: Vehicle) => void;
  className?: string;
}

export default function VehicleForm({ vehicle, onVehicleChange, className = '' }: VehicleFormProps) {
  const carBrands = [
    'Audi', 'BMW', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 
    'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 
    'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo', 'Øvrige'
  ];

  const carSizes = [
    { value: 'mini', label: 'Mini (f.eks. Smart, Fiat 500)' },
    { value: 'mellem', label: 'Mellemklasse (f.eks. Golf, Focus)' },
    { value: 'sedan', label: 'Sedan (f.eks. Passat, Camry)' },
    { value: 'stationcar', label: 'Stationcar (f.eks. V70, Passat Variant)' },
    { value: 'suv', label: 'SUV (f.eks. X3, Q5, Tucson)' },
    { value: 'varevogn', label: 'Varevogn (f.eks. Transit, Sprinter)' }
  ];

  const handleBrandChange = (brand: string) => {
    onVehicleChange({
      id: vehicle?.id || 'vehicle-1',
      brand,
      model: vehicle?.model || '',
      size: vehicle?.size || 'mellem',
      selected: true
    });
  };

  const handleModelChange = (model: string) => {
    onVehicleChange({
      id: vehicle?.id || 'vehicle-1',
      brand: vehicle?.brand || '',
      model,
      size: vehicle?.size || 'mellem',
      selected: true
    });
  };

  const handleSizeChange = (size: 'mini' | 'mellem' | 'sedan' | 'stationcar' | 'suv' | 'varevogn') => {
    onVehicleChange({
      id: vehicle?.id || 'vehicle-1',
      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      size,
      selected: true
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-md font-medium text-gray-900">
        Biloplysninger
      </h4>
      
      {/* Car Size Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilstørrelse *
        </label>
        <select
          value={vehicle?.size || 'mellem'}
          onChange={(e) => handleSizeChange(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue"
          required
        >
          {carSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Car Brand Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilmærke *
        </label>
        <select
          value={vehicle?.brand || ''}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue"
          required
        >
          <option value="">Vælg bilmærke</option>
          {carBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Car Model Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Bilmodel *
        </label>
        <input
          type="text"
          value={vehicle?.model || ''}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="f.eks. Golf, Focus, Passat"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue"
          required
        />
      </div>

      {/* Information Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Prisen afhænger af bilens størrelse og den pakke du vælger. Større biler koster mere at rengøre.
        </p>
      </div>
    </div>
  );
}
