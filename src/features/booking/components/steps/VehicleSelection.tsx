'use client';

import { useBookingStore } from '@/store/booking';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { TruckIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { VehicleType as VehicleTypeEnum, VehicleSize } from '@/types';

interface SavedVehicle {
  id: string;
  brand: { name: string };
  model: { name: string };
  year: number | null;
  color: string | null;
  licensePlate: string | null;
  nickname: string | null;
  isDefault: boolean;
}

interface VehicleTypeOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  sizeMultiplier: number;
  icon: string;
}

const vehicleTypes: VehicleTypeOption[] = [
  {
    id: 'small-car',
    name: 'Lille bil',
    description: 'Mindre biler som Citroën C1, Peugeot 108, Toyota Aygo',
    basePrice: 250,
    sizeMultiplier: 0.8,
    icon: '🚗',
  },
  {
    id: 'medium-car',
    name: 'Mellem bil',
    description: 'Standard biler som Volkswagen Golf, Ford Focus, Opel Astra',
    basePrice: 300,
    sizeMultiplier: 1.0,
    icon: '🚙',
  },
  {
    id: 'large-car',
    name: 'Stor bil',
    description: 'Store biler som BMW X5, Audi Q7, Mercedes GLE',
    basePrice: 400,
    sizeMultiplier: 1.3,
    icon: '🚐',
  },
  {
    id: 'van',
    name: 'Varevogn',
    description: 'Varevogne og erhvervskøretøjer',
    basePrice: 500,
    sizeMultiplier: 1.6,
    icon: '🚛',
  },
];

export default function VehicleSelection() {
  const { data: session } = useSession();
  const {
    selectedVehicle,
    isAuthenticated,
    setVehicle,
  } = useBookingStore();

  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleTypeOption | null>(null);

  // Load saved vehicles for authenticated users
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      loadSavedVehicles();
    }
  }, [isAuthenticated, session]);

  const loadSavedVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/vehicles');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedVehicles(result.data.vehicles || []);
        }
      }
    } catch (error) {
      console.error('Error loading saved vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for type-safe vehicle mapping
  const getVehicleType = (typeId: string): VehicleTypeEnum => {
    const typeMap: Record<string, VehicleTypeEnum> = {
      'car': 'CAR',
      'small-car': 'CAR',
      'medium-car': 'CAR',
      'large-car': 'CAR',
      'suv': 'SUV',
      'van': 'VAN',
      'truck': 'TRUCK',
      'motorcycle': 'MOTORCYCLE'
    };
    return typeMap[typeId] || 'CAR';
  };

  const getVehicleSize = (typeId: string): VehicleSize => {
    const sizeMap: Record<string, VehicleSize> = {
      'small-car': 'SMALL',
      'large-car': 'LARGE',
      'van': 'LARGE',
      'truck': 'EXTRA_LARGE'
    };
    return sizeMap[typeId] || 'MEDIUM';
  };

  const handleVehicleTypeSelect = (vehicleType: VehicleTypeOption) => {
    setSelectedType(vehicleType);
    // Create a temporary vehicle object for the booking with proper typing
    const tempVehicle = {
      id: `temp-${vehicleType.id}`,
      make: vehicleType.name,
      model: 'Generic',
      year: new Date().getFullYear(),
      type: getVehicleType(vehicleType.id),
      licensePlate: '',
      size: getVehicleSize(vehicleType.id),
    };
    setVehicle(tempVehicle);
  };

  const handleSavedVehicleSelect = (savedVehicle: SavedVehicle) => {
    // Convert saved vehicle to booking vehicle format with proper typing
    const bookingVehicle = {
      id: savedVehicle.id,
      make: savedVehicle.brand.name,
      model: savedVehicle.model.name,
      year: savedVehicle.year || new Date().getFullYear(),
      type: 'CAR' as VehicleTypeEnum, // Default, could be enhanced with vehicle size detection
      licensePlate: savedVehicle.licensePlate || '',
      color: savedVehicle.color || undefined,
      size: 'MEDIUM' as VehicleSize, // Would be calculated based on vehicle size
    };
    setVehicle(bookingVehicle);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vælg dit køretøj
        </h2>
        <p className="text-gray-600">
          {isAuthenticated 
            ? 'Vælg fra dine gemte køretøjer eller angiv køretøjstype.'
            : 'Vælg den type køretøj der skal rengøres.'
          }
        </p>
      </div>

      {/* Saved Vehicles (for authenticated users) */}
      {isAuthenticated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Dine køretøjer</h3>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tilføj køretøj
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-20"></div>
                </div>
              ))}
            </div>
          ) : savedVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSavedVehicleSelect(vehicle)}
                  className={`relative p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {selectedVehicle?.id === vehicle.id && (
                    <div className="absolute top-2 right-2">
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex items-center mb-2">
                    <TruckIcon className="h-6 w-6 text-gray-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {vehicle.nickname || `${vehicle.brand.name} ${vehicle.model.name}`}
                      </h4>
                      {vehicle.nickname && (
                        <p className="text-sm text-gray-500">
                          {vehicle.brand.name} {vehicle.model.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {vehicle.year && (
                      <p>Årgang: {vehicle.year}</p>
                    )}
                    {vehicle.color && (
                      <p>Farve: {vehicle.color}</p>
                    )}
                    {vehicle.licensePlate && (
                      <p>Nummerplade: {vehicle.licensePlate}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen gemte køretøjer</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tilføj dit første køretøj for hurtigere booking næste gang
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Eller vælg køretøjstype</h3>
          </div>
        </div>
      )}

      {/* Vehicle Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicleTypes.map((vehicleType) => (
          <button
            key={vehicleType.id}
            onClick={() => handleVehicleTypeSelect(vehicleType)}
            className={`relative p-6 border-2 rounded-lg text-left transition-colors ${
              selectedType?.id === vehicleType.id || selectedVehicle?.type === vehicleType.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            {(selectedType?.id === vehicleType.id || selectedVehicle?.type === vehicleType.id) && (
              <div className="absolute top-3 right-3">
                <CheckIcon className="h-5 w-5 text-blue-600" />
              </div>
            )}
            
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{vehicleType.icon}</span>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {vehicleType.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  Fra {vehicleType.basePrice} kr.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {vehicleType.description}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Vehicle Summary */}
      {selectedVehicle && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-green-800 font-medium">
                Valgt køretøj: {selectedVehicle.make} {selectedVehicle.model}
              </h4>
              <p className="text-green-600 text-sm">
                {selectedVehicle.licensePlate && `${selectedVehicle.licensePlate} • `}
                Type: {selectedVehicle.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Form (simplified version) */}
      {showAddVehicle && isAuthenticated && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tilføj nyt køretøj</h4>
          <p className="text-sm text-gray-600 mb-3">
            Denne funktion kommer snart. Du kan gemme køretøjsoplysninger til din profil for hurtigere booking.
          </p>
          <button
            onClick={() => setShowAddVehicle(false)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Luk
          </button>
        </div>
      )}

      {/* Guest User Prompt */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-1">
            Log ind for at gemme køretøjer
          </h4>
          <p className="text-blue-600 text-sm">
            Med en konto kan du gemme køretøjsoplysninger for hurtigere booking næste gang.
          </p>
        </div>
      )}
    </div>
  );
}
