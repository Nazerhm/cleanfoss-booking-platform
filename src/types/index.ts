export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  extras?: ServiceExtra[];
  pricing: {
    basePrice: number;
    baseDuration: number;
    finalPrice: number;
    finalDuration: number;
  };
}

export interface ServiceExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  licensePlate: string;
  color?: string;
  size?: VehicleSize;
}

export type VehicleType = 'CAR' | 'SUV' | 'VAN' | 'TRUCK' | 'MOTORCYCLE';
export type VehicleSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  vehicleId: string;
  customerId: string;
  companyId: string;
  scheduledAt: Date;
  status: BookingStatus;
  totalPrice: number;
  location: BookingLocation;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  vehicles: Vehicle[];
  bookings: Booking[];
}
