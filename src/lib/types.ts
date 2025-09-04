// Core booking types for CleanFoss platform

export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'suv' | 'van' | 'truck';
  selected: boolean;
}

export interface ProductType {
  id: string;
  name: string;
  type: 'car' | 'baby-trolley' | 'motorcycle' | 'yacht' | 'other';
  image?: string;
  selected: boolean;
}

export interface MainProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  productType: 'car' | 'baby-trolley' | 'motorcycle' | 'yacht' | 'other';
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Addon {
  id: string;
  name: string;
  price?: number;
  unitPrice?: number;
  type: 'boolean' | 'quantity';
  min?: number;
  max?: number;
  description?: string;
  productType: 'car' | 'baby-trolley' | 'motorcycle' | 'yacht' | 'other' | 'universal';
}

export interface AddonSelection {
  addon: Addon;
  selected: boolean;
  quantity: number;
}

export interface VehicleDetails {
  selectedCar: CarModel | null;
}

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  size: 'mini' | 'mellem' | 'sedan' | 'stationcar' | 'suv' | 'mpv' | 'varevogn';
  searchTerms: string[];
}

export interface ProductBooking {
  id: string;
  productType: ProductType | null;
  mainProduct: MainProduct | null;
  addons: AddonSelection[];
  vehicleDetails?: VehicleDetails; // Only for car products
  subtotal: number;
  discount: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  date: string;
  time: string;
  timeSlot?: TimeSlot;
  customStartTime?: string;
  customEndTime?: string;
  useCustomTime: boolean;
  notes?: string;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
}

export interface Consents {
  createAccount: boolean;
  marketing: boolean;
  terms: boolean;
}

export interface BookingData {
  products: ProductBooking[];
  customer: Customer;
  schedule: Schedule;
  address: Address;
  consents: Consents;
  specialRequests: string;
}

export interface LineItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  productId?: string;
  type: 'main-product' | 'addon' | 'discount';
}

export interface PricingSummary {
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  total: number;
  vat: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}
