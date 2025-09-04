'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CarModel } from '../lib/types';
import { searchCars } from '../lib/carDatabase';

interface CarSearchProps {
  selectedCar: CarModel | null;
  onCarSelect: (car: CarModel | null) => void;
  className?: string;
}

export default function CarSearch({ selectedCar, onCarSelect, className = '' }: CarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CarModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update search query when car is selected externally
  useEffect(() => {
    if (selectedCar) {
      setSearchQuery(`${selectedCar.brand} ${selectedCar.model}`);
      setIsOpen(false);
    } else {
      setSearchQuery('');
    }
  }, [selectedCar]);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchCars(searchQuery, 8);
      setSearchResults(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear selection if user types something different
    if (selectedCar && value !== `${selectedCar.brand} ${selectedCar.model}`) {
      onCarSelect(null);
    }
  };

  // Handle car selection
  const handleCarSelect = (car: CarModel) => {
    onCarSelect(car);
    setSearchQuery(`${car.brand} ${car.model}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handleCarSelect(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur (with delay to allow for clicks)
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  // Get size category label and multiplier
  const getSizeInfo = (size: CarModel['size']) => {
    const sizeMap = {
      'mini': { label: 'Minibil', multiplier: 0.8 },
      'mellem': { label: 'Mellembil', multiplier: 1.0 },
      'sedan': { label: 'Sedan', multiplier: 1.1 },
      'stationcar': { label: 'Stationcar', multiplier: 1.2 },
      'suv': { label: 'SUV', multiplier: 1.3 },
      'mpv': { label: 'MPV/Minivan', multiplier: 1.3 },
      'varevogn': { label: 'Varevogn', multiplier: 1.5 },
    };
    return sizeMap[size] || { label: 'Ukendt', multiplier: 1.0 };
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Søg efter din bil
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Skriv bilmærke og model (f.eks. Audi A4, Golf, BMW X5)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cleanfoss-blue focus:border-cleanfoss-blue pl-10"
          />
          
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onCarSelect(null);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {searchResults.map((car, index) => {
            const sizeInfo = getSizeInfo(car.size);
            const isHighlighted = index === highlightedIndex;
            const isSelected = selectedCar?.id === car.id;
            
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => handleCarSelect(car)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                  ${isHighlighted ? 'bg-cleanfoss-blue/5' : ''}
                  ${isSelected ? 'bg-cleanfoss-blue/10 border-cleanfoss-blue' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {car.brand} {car.model}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sizeInfo.label}
                      {sizeInfo.multiplier !== 1.0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({sizeInfo.multiplier > 1.0 ? '+' : ''}{Math.round((sizeInfo.multiplier - 1) * 100)}% pris)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-5 h-5 text-cleanfoss-blue">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          
          {/* No exact matches hint */}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-sm">
              Ingen biler fundet. Prøv med et andet søgeord.
            </div>
          )}
        </div>
      )}
      
      {/* Selected car info */}
      {selectedCar && (
        <div className="mt-3 p-3 bg-cleanfoss-blue/5 border border-cleanfoss-blue/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-cleanfoss-blue">
                {selectedCar.brand} {selectedCar.model}
              </div>
              <div className="text-sm text-gray-600">
                {getSizeInfo(selectedCar.size).label}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {getSizeInfo(selectedCar.size).multiplier !== 1.0 ? (
                <>
                  {getSizeInfo(selectedCar.size).multiplier > 1.0 ? '+' : ''}
                  {Math.round((getSizeInfo(selectedCar.size).multiplier - 1) * 100)}% pris
                </>
              ) : (
                'Standard pris'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
