// Customer information form component

import React from 'react';
import { Customer, FormErrors } from '../lib/types';

interface CustomerFormProps {
  customer: Customer;
  onChange: (customer: Customer) => void;
  errors: FormErrors;
  className?: string;
}

export default function CustomerForm({
  customer,
  onChange,
  errors,
  className = ''
}: CustomerFormProps) {
  const handleChange = (field: keyof Customer, value: string) => {
    onChange({
      ...customer,
      [field]: value
    });
  };

  return (
    <fieldset className={className}>
      <legend className="text-lg font-semibold text-gray-900 mb-4">
        Dine oplysninger
      </legend>
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
            Navn *
          </label>
          <input
            type="text"
            id="customer-name"
            value={customer.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Indtast dit fulde navn"
            aria-describedby={errors.name ? 'customer-name-error' : undefined}
          />
          {errors.name && (
            <p id="customer-name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            type="email"
            id="customer-email"
            value={customer.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="navn@eksempel.dk"
            aria-describedby={errors.email ? 'customer-email-error' : undefined}
          />
          {errors.email && (
            <p id="customer-email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            id="customer-phone"
            value={customer.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="12 34 56 78"
            aria-describedby={errors.phone ? 'customer-phone-error' : undefined}
          />
          {errors.phone && (
            <p id="customer-phone-error" className="mt-1 text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
