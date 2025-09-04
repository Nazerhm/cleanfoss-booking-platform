'use client';

import React from 'react';
import { ProductType } from '../lib/types';

interface ProductTypeSelectorProps {
  productTypes: ProductType[];
  onSelectProductType: (productType: ProductType) => void;
  selectedProductType?: ProductType | null;
}

export default function ProductTypeSelector({ 
  productTypes, 
  onSelectProductType, 
  selectedProductType 
}: ProductTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Hvad skal vi rengøre?
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {productTypes.map((productType) => (
          <button
            key={productType.id}
            onClick={() => onSelectProductType(productType)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-center relative
              ${selectedProductType?.id === productType.id
                ? 'border-cleanfoss-blue bg-cleanfoss-blue/10 text-cleanfoss-blue ring-2 ring-cleanfoss-blue/20 shadow-md' 
                : 'border-gray-200 bg-white text-gray-700 hover:border-cleanfoss-blue/30 hover:bg-cleanfoss-blue/5'
              }
            `}
          >
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 flex items-center justify-center">
                {getProductTypeIcon(productType.type)}
              </div>
              <div className="font-medium text-sm">
                {productType.name}
              </div>
              {selectedProductType?.id === productType.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-cleanfoss-blue rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getProductTypeIcon(type: string) {
  switch (type) {
    case 'car':
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'baby-trolley':
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'motorcycle':
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'yacht':
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}
