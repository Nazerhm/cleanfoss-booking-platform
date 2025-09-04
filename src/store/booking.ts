import { create } from 'zustand';
import { Service, Vehicle, ServiceExtra } from '@/types';
import type { User } from 'next-auth';

export type BookingStep = 'service' | 'datetime' | 'vehicle' | 'customer' | 'summary';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences?: {
    contactMethod: 'email' | 'sms' | 'both';
    specialInstructions?: string;
  };
}

export interface BookingLocation {
  type: 'home' | 'work' | 'other';
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  parkingInstructions?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  extrasPrice: number;
  vehicleMultiplier: number;
  subtotal: number;
  vat: number;
  total: number;
  currency: string;
}

interface BookingState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  shouldSaveToAccount: boolean;
  
  // Current step
  currentStep: BookingStep;
  
  // Booking data
  selectedService: Service | null;
  selectedVehicle: Vehicle | null;
  selectedDateTime: Date | null;
  selectedExtras: ServiceExtra[];
  customerInfo: Partial<CustomerInfo>;
  bookingLocation: Partial<BookingLocation>;
  
  // Pricing
  pricing: PricingBreakdown | null;
  
  // UI state
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Actions
  setStep: (step: BookingStep) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setSaveToAccount: (save: boolean) => void;
  prePopulateFromUser: (user: User) => void;
  setService: (service: Service) => void;
  setVehicle: (vehicle: Vehicle) => void;
  setDateTime: (dateTime: Date) => void;
  setExtras: (extras: ServiceExtra[]) => void;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setBookingLocation: (location: Partial<BookingLocation>) => void;
  updatePricing: (pricing: PricingBreakdown) => void;
  setLoading: (loading: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  resetBooking: () => void;
  
  // Navigation helpers
  nextStep: () => void;
  previousStep: () => void;
  canProceed: () => boolean;
  calculatePricing: () => Promise<void>;
  submitBooking: () => Promise<{ success: boolean; bookingId?: string; error?: string }>;
}

const initialState = {
  // Authentication state
  user: null,
  isAuthenticated: false,
  shouldSaveToAccount: false,
  
  // Booking state
  currentStep: 'service' as BookingStep,
  selectedService: null,
  selectedVehicle: null,
  selectedDateTime: null,
  selectedExtras: [],
  customerInfo: {},
  bookingLocation: {},
  pricing: null,
  isLoading: false,
  errors: {},
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,
  
  setStep: (step) => set({ currentStep: step }),
  
  // Authentication actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  
  setSaveToAccount: (save) => set({ shouldSaveToAccount: save }),
  
  prePopulateFromUser: (user) => {
    const nameParts = user.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    set({
      customerInfo: {
        name: user.name || '',
        email: user.email || '',
        phone: '', // Will be populated from user profile if available
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Danmark',
        },
      },
      user,
      isAuthenticated: true,
    });
  },
  
  setService: (service) => {
    set({ selectedService: service });
    // Trigger pricing recalculation
    get().calculatePricing();
  },
  
  setVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
    // Trigger pricing recalculation
    get().calculatePricing();
  },
  
  setDateTime: (dateTime) => set({ selectedDateTime: dateTime }),
  
  setExtras: (extras) => {
    set({ selectedExtras: extras });
    // Trigger pricing recalculation
    get().calculatePricing();
  },
  
  setCustomerInfo: (info) => set((state) => ({
    customerInfo: { ...state.customerInfo, ...info }
  })),
  
  setBookingLocation: (location) => set((state) => ({
    bookingLocation: { ...state.bookingLocation, ...location }
  })),
  
  updatePricing: (pricing) => set({ pricing }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (field, error) => set((state) => ({
    errors: { ...state.errors, [field]: error }
  })),
  
  clearError: (field) => set((state) => {
    const { [field]: _, ...errors } = state.errors;
    return { errors };
  }),
  
  resetBooking: () => set(initialState),
  
  nextStep: () => {
    const steps: BookingStep[] = ['service', 'datetime', 'vehicle', 'customer', 'summary'];
    const currentIndex = steps.indexOf(get().currentStep);
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] });
    }
  },
  
  previousStep: () => {
    const steps: BookingStep[] = ['service', 'datetime', 'vehicle', 'customer', 'summary'];
    const currentIndex = steps.indexOf(get().currentStep);
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] });
    }
  },
  
  canProceed: () => {
    const state = get();
    switch (state.currentStep) {
      case 'service':
        return !!state.selectedService;
      case 'datetime':
        return !!state.selectedDateTime;
      case 'vehicle':
        return !!state.selectedVehicle;
      case 'customer': {
        const { customerInfo } = state;
        const hasRequiredInfo = !!(
          customerInfo.name && 
          customerInfo.email && 
          customerInfo.phone &&
          customerInfo.address?.street &&
          customerInfo.address?.postalCode &&
          customerInfo.address?.city
        );
        const hasNoErrors = Object.keys(state.errors).length === 0;
        return hasRequiredInfo && hasNoErrors;
      }
      case 'summary':
        return true;
      default:
        return false;
    }
  },
  
  // Helper method for pricing calculation
  calculatePricing: async () => {
    const state = get();
    const { selectedService, selectedVehicle, selectedExtras } = state;
    
    if (!selectedService) {
      console.log('No service selected, skipping pricing calculation');
      return;
    }
    
    console.log('Calculating pricing for:', {
      serviceId: selectedService.id,
      vehicleType: selectedVehicle?.type || 'CAR',
      extras: selectedExtras.map(e => e.id),
    });
    
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          vehicleType: selectedVehicle?.type || 'CAR',
          extras: selectedExtras.map(e => e.id),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Pricing API response:', result);
        if (result.success && result.pricing) {
          console.log('Setting pricing:', result.pricing);
          set({ pricing: result.pricing });
        } else {
          console.error('Pricing API returned success: false or no pricing data');
        }
      } else {
        console.error('Pricing API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Submit booking method
  submitBooking: async () => {
    const state = get();
    const { 
      selectedService, 
      selectedVehicle, 
      selectedDateTime, 
      selectedExtras, 
      customerInfo, 
      pricing,
      user,
      isAuthenticated,
      shouldSaveToAccount,
    } = state;

    // Validate all required data
    if (!selectedService || !selectedVehicle || !selectedDateTime || !customerInfo.name || !customerInfo.email || !customerInfo.phone || !pricing) {
      return { success: false, error: 'Missing required booking information' };
    }

    try {
      set({ isLoading: true, errors: {} });

      const bookingData = {
        // Service details
        serviceId: selectedService.id,
        extras: selectedExtras.map(e => e.id),
        
        // Vehicle details  
        vehicleId: selectedVehicle.id,
        
        // Scheduling
        scheduledAt: selectedDateTime.toISOString(),
        duration: selectedService.duration || 120, // Default 2 hours
        
        // Customer information
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        
        // Location details
        location: {
          name: `${customerInfo.name}'s Location`,
          address: customerInfo.address?.street,
          city: customerInfo.address?.city,
          postalCode: customerInfo.address?.postalCode,
          country: customerInfo.address?.country || 'Denmark',
        },
        
        // Authentication state
        isAuthenticated,
        customerId: user?.id || null,
        shouldSaveToAccount: !isAuthenticated && shouldSaveToAccount,
        
        // Pricing
        totalPrice: pricing.total,
        
        // Optional fields
        notes: customerInfo.preferences?.specialInstructions,
      };

      console.log('Submitting booking:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Booking submitted successfully:', result.booking?.id);
        // Reset the booking state after successful submission
        set(initialState);
        return { success: true, bookingId: result.booking?.id };
      } else {
        console.error('Booking submission failed:', result.error);
        return { success: false, error: result.error || 'Failed to submit booking' };
      }

    } catch (error) {
      console.error('Error submitting booking:', error);
      return { success: false, error: 'Network error - please try again' };
    } finally {
      set({ isLoading: false });
    }
  },
}));
