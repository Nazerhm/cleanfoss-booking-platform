// Address form component

import React from 'react';
import { Address, FormErrors } from '../lib/types';

interface AddressFormProps {
  address: Address;
  onChange: (address: Address) => void;
  errors: FormErrors;
  className?: string;
}

export default function AddressForm({
  address,
  onChange,
  errors,
  className = ''
}: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  return (
    <fieldset className={className}>
      <legend className="text-lg font-semibold text-gray-900 mb-4">
        Adresse
      </legend>
      
      <div className="space-y-4">
        {/* Street address */}
        <div>
          <label htmlFor="address-street" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <input
            type="text"
            id="address-street"
            value={address.street}
            onChange={(e) => handleChange('street', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Gade og husnummer"
            aria-describedby={errors.street ? 'address-street-error' : undefined}
          />
          {errors.street && (
            <p id="address-street-error" className="mt-1 text-sm text-red-600">
              {errors.street}
            </p>
          )}
        </div>

        {/* Postal code and city */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Postal code */}
          <div>
            <label htmlFor="address-postal-code" className="block text-sm font-medium text-gray-700 mb-1">
              Postnr *
            </label>
            <input
              type="text"
              id="address-postal-code"
              value={address.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={`
                w-full h-11 px-3 border rounded-lg text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="1234"
              maxLength={4}
              aria-describedby={errors.postalCode ? 'address-postal-code-error' : undefined}
            />
            {errors.postalCode && (
              <p id="address-postal-code-error" className="mt-1 text-sm text-red-600">
                {errors.postalCode}
              </p>
            )}
          </div>

          {/* City */}
          <div className="sm:col-span-2">
            <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-1">
              By *
            </label>
            <input
              type="text"
              id="address-city"
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`
                w-full h-11 px-3 border rounded-lg text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="By"
              aria-describedby={errors.city ? 'address-city-error' : undefined}
            />
            {errors.city && (
              <p id="address-city-error" className="mt-1 text-sm text-red-600">
                {errors.city}
              </p>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
