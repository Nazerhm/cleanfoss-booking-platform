// Unit tests for pricing engine

import { describe, it, expect } from 'vitest';
import { 
  calculateVehicleSubtotal,
  calculateVehicleDiscount,
  calculatePricing,
  createDefaultVehicleBooking,
  getDefaultAddonSelections
} from '../src/lib/pricing';
import { VehicleBooking } from '../src/lib/types';

describe('Pricing Engine', () => {
  describe('calculateVehicleSubtotal', () => {
    it('calculates subtotal for boolean addons', () => {
      const vehicleBooking: VehicleBooking = {
        id: 'test-vehicle',
        vehicle: null,
        addons: [
          {
            addon: { id: 'full-car', name: 'Hele bilen', price: 999, type: 'boolean' },
            selected: true,
            quantity: 1,
          },
          {
            addon: { id: 'pet-hair', name: 'Fjernelse af hundehår', price: 199, type: 'boolean' },
            selected: true,
            quantity: 1,
          },
          {
            addon: { id: 'leather-care', name: 'Læderpleje', price: 179, type: 'boolean' },
            selected: false,
            quantity: 1,
          },
        ],
        subtotal: 0,
        discount: 0,
      };

      const subtotal = calculateVehicleSubtotal(vehicleBooking);
      expect(subtotal).toBe(1198); // 999 + 199
    });

    it('calculates subtotal for quantity addons', () => {
      const vehicleBooking: VehicleBooking = {
        id: 'test-vehicle',
        vehicle: null,
        addons: [
          {
            addon: { id: 'deep-seat', name: 'Dybdegående sæderens', unitPrice: 99, type: 'quantity', min: 1, max: 7 },
            selected: true,
            quantity: 3,
          },
        ],
        subtotal: 0,
        discount: 0,
      };

      const subtotal = calculateVehicleSubtotal(vehicleBooking);
      expect(subtotal).toBe(297); // 99 * 3
    });
  });

  describe('calculateVehicleDiscount', () => {
    it('returns 0 discount for first vehicle', () => {
      const vehicleBooking = createDefaultVehicleBooking('vehicle-1');
      const discount = calculateVehicleDiscount(vehicleBooking, 0);
      expect(discount).toBe(0);
    });

    it('calculates 10% discount for second vehicle', () => {
      const vehicleBooking: VehicleBooking = {
        id: 'vehicle-2',
        vehicle: null,
        addons: [
          {
            addon: { id: 'full-car', name: 'Hele bilen', price: 1000, type: 'boolean' },
            selected: true,
            quantity: 1,
          },
        ],
        subtotal: 0,
        discount: 0,
      };

      const discount = calculateVehicleDiscount(vehicleBooking, 1);
      expect(discount).toBe(100); // 10% of 1000
    });
  });

  describe('calculatePricing', () => {
    it('calculates correct total with VAT for single vehicle', () => {
      const vehicles = [createDefaultVehicleBooking('vehicle-1')];
      
      // Set up default selections (Hele bilen + Hundehår + Læderpleje)
      vehicles[0].addons[0].selected = true; // Hele bilen: 999
      vehicles[0].addons[1].selected = true; // Hundehår: 199  
      vehicles[0].addons[2].selected = true; // Læderpleje: 179
      vehicles[0].addons[3].selected = false; // Deep seat: not selected
      vehicles[0].addons[4].selected = false; // Tire shine: not selected

      const pricing = calculatePricing(vehicles);
      
      expect(pricing.total).toBe(1377); // 999 + 199 + 179 = 1377
      expect(pricing.vat).toBeCloseTo(275.4, 1); // VAT calculation
      expect(pricing.discount).toBe(0); // No discount for single vehicle
    });

    it('calculates correct total with discount for two vehicles', () => {
      const vehicle1 = createDefaultVehicleBooking('vehicle-1');
      const vehicle2 = createDefaultVehicleBooking('vehicle-2');
      
      // Vehicle 1: Hele bilen only (999)
      vehicle1.addons[0].selected = true;
      vehicle1.addons[1].selected = false;
      vehicle1.addons[2].selected = false;
      vehicle1.addons[3].selected = false;
      vehicle1.addons[4].selected = false;
      
      // Vehicle 2: Hele bilen only (999), but gets 10% discount
      vehicle2.addons[0].selected = true;
      vehicle2.addons[1].selected = false;
      vehicle2.addons[2].selected = false;
      vehicle2.addons[3].selected = false;
      vehicle2.addons[4].selected = false;

      const vehicles = [vehicle1, vehicle2];
      const pricing = calculatePricing(vehicles);
      
      expect(pricing.subtotal).toBe(1998); // 999 + 999
      expect(pricing.discount).toBe(100); // 10% of vehicle 2
      expect(pricing.total).toBe(1898); // 1998 - 100
    });
  });

  describe('edge cases', () => {
    it('handles quantity addon min/max values', () => {
      const vehicleBooking: VehicleBooking = {
        id: 'test-vehicle',
        vehicle: null,
        addons: [
          {
            addon: { id: 'deep-seat', name: 'Dybdegående sæderens', unitPrice: 99, type: 'quantity', min: 1, max: 7 },
            selected: true,
            quantity: 1, // minimum
          },
        ],
        subtotal: 0,
        discount: 0,
      };

      let subtotal = calculateVehicleSubtotal(vehicleBooking);
      expect(subtotal).toBe(99);

      // Test maximum
      vehicleBooking.addons[0].quantity = 7;
      subtotal = calculateVehicleSubtotal(vehicleBooking);
      expect(subtotal).toBe(693); // 99 * 7
    });

    it('handles empty vehicle list', () => {
      const pricing = calculatePricing([]);
      expect(pricing.total).toBe(0);
      expect(pricing.vat).toBe(0);
      expect(pricing.discount).toBe(0);
    });
  });
});
