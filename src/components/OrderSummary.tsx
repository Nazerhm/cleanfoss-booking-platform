// Order summary component for desktop sidebar and mobile display

import React from 'react';
import { PricingSummary, Customer, Schedule, Address } from '../lib/types';
import { formatDKK, formatDateDK } from '../lib/format';

interface OrderSummaryProps {
  pricing: PricingSummary;
  customer?: Customer;
  schedule?: Schedule;
  address?: Address;
  className?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export default function OrderSummary({
  pricing,
  customer,
  schedule,
  address,
  className = '',
  onSubmit,
  isSubmitting = false
}: OrderSummaryProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ordreoversigt
      </h3>
      
      {/* Customer and booking details */}
      {(customer?.name || schedule?.date || address?.street) && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Booking detaljer
          </h4>
          
          {customer?.name && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">Navn:</span>
              <span className="text-sm text-gray-900">{customer.name}</span>
            </div>
          )}
          
          {customer?.email && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">E-mail:</span>
              <span className="text-sm text-gray-900">{customer.email}</span>
            </div>
          )}
          
          {customer?.phone && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">Telefon:</span>
              <span className="text-sm text-gray-900">{customer.phone}</span>
            </div>
          )}
          
          {schedule?.date && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">Dato:</span>
              <span className="text-sm text-gray-900">{formatDateDK(schedule.date)}</span>
            </div>
          )}
          
          {(schedule?.timeSlot?.label || schedule?.time) && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">Tidspunkt:</span>
              <span className="text-sm text-gray-900">
                {schedule.timeSlot?.label || schedule.time}
              </span>
            </div>
          )}
          
          {address?.street && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 block">Adresse:</span>
              <div className="text-sm text-gray-900">
                <div>{address.street}</div>
                {address.postalCode && address.city && (
                  <div>{address.postalCode} {address.city}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Line items */}
      <div className="space-y-3 mb-6">
        {pricing.lineItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <span className="text-sm text-gray-700 flex-1 pr-2">
              {item.name}
            </span>
            <span className={`text-sm font-medium ${
              item.type === 'discount' ? 'text-green-600' : 'text-gray-900'
            }`}>
              {item.type === 'discount' && '−'}{formatDKK(Math.abs(item.price))}
            </span>
          </div>
        ))}
      </div>
      
      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            I alt
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {formatDKK(pricing.total)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Heraf moms
          </span>
          <span className="text-sm text-gray-600">
            {formatDKK(pricing.vat)}
          </span>
        </div>
      </div>
      
      {/* Payment info banner */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 leading-relaxed">
          Du betaler først, når vi har rengjort din bil! ☺ Efter at din bil er rengjort og behandlet modtager du et link på e-mail og sms til betaling. Du kan betale med almindelig kreditkort eller MobilePay. Vi modtager IKKE kontanter.
        </p>
      </div>
      
      {/* CTA Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="
          w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isSubmitting ? 'Behandler...' : 'Godkend behandling'}
      </button>
    </div>
  );
}
