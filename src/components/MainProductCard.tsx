'use client';

import React from 'react';
import { MainProduct } from '../lib/types';
import { formatDKK } from '../lib/format';

interface MainProductCardProps {
  product: MainProduct;
  isSelected: boolean;
  onSelect: () => void;
}

export default function MainProductCard({ product, isSelected, onSelect }: MainProductCardProps) {
  return (
    <div
      className={`
        border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 relative
        ${isSelected 
          ? 'border-cleanfoss-blue bg-cleanfoss-blue/10 ring-2 ring-cleanfoss-blue/20 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-cleanfoss-blue/30 hover:shadow-md'
        }
      `}
      onClick={onSelect}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-cleanfoss-blue rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {/* Image placeholder */}
      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-xs">Billede kommer</div>
        </div>
      </div>
      
      {/* Product info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className={`font-semibold ${isSelected ? 'text-cleanfoss-blue' : 'text-gray-900'}`}>
            {product.name}
          </h4>
          <div className={`text-sm font-medium ${isSelected ? 'text-cleanfoss-blue' : 'text-gray-600'}`}>
            {formatDKK(product.price)}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ca. {product.duration} min
        </div>
        
        {isSelected && (
          <div className="flex items-center text-cleanfoss-blue text-sm font-medium mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Valgt
          </div>
        )}
        
        {isSelected && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 bg-cleanfoss-blue rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
