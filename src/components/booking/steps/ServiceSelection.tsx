'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/booking';
import { Service, ServiceExtra } from '@/types';
import { CheckIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ServiceSelection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    selectedService,
    selectedExtras,
    setService,
    setExtras,
    pricing,
  } = useBookingStore();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?companyId=demo-company-id');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setService(service);
    // Reset extras when changing service
    setExtras([]);
  };

  const handleExtraToggle = (extra: ServiceExtra) => {
    const isSelected = selectedExtras.some(e => e.id === extra.id);
    if (isSelected) {
      setExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setExtras([...selectedExtras, extra]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Indlæser services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vælg din service
        </h2>
        <p className="text-gray-600">
          Vælg den service du ønsker, og tilføj eventuelle ekstra ydelser.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedService?.id === service.id
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            {/* Service Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {service.description}
                </p>
              </div>
              
              {selectedService?.id === service.id && (
                <CheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
              )}
            </div>

            {/* Service Details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pris fra:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(service.pricing.basePrice)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Varighed:</span>
                <span className="text-sm text-gray-700">
                  {service.pricing.baseDuration} min
                </span>
              </div>

              {/* Rating (mock data) */}
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-4 w-4 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">4.9 (127 anmeldelser)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Extras */}
      {selectedService?.extras && selectedService.extras.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tilføj ekstra ydelser
          </h3>
          
          <div className="space-y-3">
            {selectedService.extras.map((extra) => {
              const isSelected = selectedExtras.some(e => e.id === extra.id);
              
              return (
                <div
                  key={extra.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleExtraToggle(extra)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <CheckIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {extra.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {extra.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        +{formatPrice(extra.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        +{extra.duration} min
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {pricing && (
        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pris oversigt
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Grundpris:</span>
                <span className="text-gray-900">{formatPrice(pricing?.basePrice || 0)}</span>
              </div>
              
              {(pricing?.extrasPrice || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ekstra ydelser:</span>
                  <span className="text-gray-900">{formatPrice(pricing?.extrasPrice || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Moms (25%):</span>
                <span className="text-gray-900">{formatPrice(pricing?.vat || 0)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">{formatPrice(pricing?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
