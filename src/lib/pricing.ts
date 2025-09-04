// Updated pricing engine for multi-product CleanFoss booking system

import { ProductBooking, LineItem, PricingSummary, AddonSelection, MainProduct, CarModel } from './types';
import { formatDKK } from './format';

/**
 * Get vehicle size price multiplier
 */
export function getVehicleSizeMultiplier(size: CarModel['size']): number {
  const multipliers = {
    'mini': 0.8,
    'mellem': 1.0,
    'sedan': 1.1,
    'stationcar': 1.2,
    'suv': 1.3,
    'mpv': 1.3,
    'varevogn': 1.5,
  };
  return multipliers[size] || 1.0;
}

/**
 * Calculate subtotal for a single product with its main product and addons
 */
export function calculateProductSubtotal(productBooking: ProductBooking): number {
  let total = 0;
  
  // Add main product price with vehicle size multiplier
  if (productBooking.mainProduct) {
    let basePrice = productBooking.mainProduct.price;
    
    // Apply vehicle size multiplier for cars
    if (productBooking.productType?.type === 'car' && productBooking.vehicleDetails?.selectedCar) {
      const sizeMultiplier = getVehicleSizeMultiplier(productBooking.vehicleDetails.selectedCar.size);
      basePrice = Math.round(basePrice * sizeMultiplier);
    }
    
    total += basePrice;
  }
  
  // Add addon prices
  total += productBooking.addons.reduce((addonTotal, addonSelection) => {
    if (!addonSelection.selected) return addonTotal;
    
    const addon = addonSelection.addon;
    if (addon.type === 'quantity' && addon.unitPrice) {
      return addonTotal + (addon.unitPrice * addonSelection.quantity);
    } else if (addon.type === 'boolean' && addon.price) {
      return addonTotal + addon.price;
    }
    
    return addonTotal;
  }, 0);
  
  return total;
}

/**
 * Calculate discount for product #2 and beyond (10% off subtotal)
 */
export function calculateProductDiscount(productBooking: ProductBooking, productIndex: number): number {
  if (productIndex === 0) return 0; // No discount for first product
  
  const subtotal = calculateProductSubtotal(productBooking);
  return Math.round(subtotal * 0.1); // 10% discount, rounded
}

/**
 * Generate line items for order summary
 */
export function generateLineItems(products: ProductBooking[]): LineItem[] {
  const lineItems: LineItem[] = [];
  
  products.forEach((productBooking, productIndex) => {
    const productLabel = productIndex === 0 ? '' : ` #${productIndex + 1}`;
    
    // Add main product line item
    if (productBooking.mainProduct) {
      lineItems.push({
        id: `${productBooking.id}-main`,
        name: productBooking.mainProduct.name + productLabel,
        price: productBooking.mainProduct.price,
        productId: productBooking.id,
        type: 'main-product',
      });
    }
    
    // Add addon line items
    productBooking.addons.forEach((addonSelection) => {
      if (!addonSelection.selected) return;
      
      const addon = addonSelection.addon;
      let price = 0;
      let name = addon.name + productLabel;
      
      if (addon.type === 'quantity' && addon.unitPrice) {
        price = addon.unitPrice * addonSelection.quantity;
        if (addonSelection.quantity > 1) {
          name += ` (${addonSelection.quantity} stk.)`;
        }
      } else if (addon.type === 'boolean' && addon.price) {
        price = addon.price;
      }
      
      lineItems.push({
        id: `${productBooking.id}-${addon.id}`,
        name,
        price,
        quantity: addon.type === 'quantity' ? addonSelection.quantity : undefined,
        productId: productBooking.id,
        type: 'addon',
      });
    });
    
    // Add discount line for product #2+
    if (productIndex > 0) {
      const discount = calculateProductDiscount(productBooking, productIndex);
      if (discount > 0) {
        lineItems.push({
          id: `discount-${productBooking.id}`,
          name: `Rabat (${productBooking.productType?.name || 'Produkt'} #${productIndex + 1})`,
          price: -discount,
          productId: productBooking.id,
          type: 'discount',
        });
      }
    }
  });
  
  return lineItems;
}

/**
 * Calculate complete pricing summary
 */
export function calculatePricing(products: ProductBooking[]): PricingSummary {
  const lineItems = generateLineItems(products);
  
  // Calculate totals
  const subtotal = lineItems
    .filter(item => item.type !== 'discount')
    .reduce((sum, item) => sum + item.price, 0);
    
  const discount = Math.abs(lineItems
    .filter(item => item.type === 'discount')
    .reduce((sum, item) => sum + item.price, 0));
  
  const total = lineItems.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate VAT (25% Danish VAT)
  // VAT = total - (total / 1.25)
  const vat = total - (total / 1.25);
  
  return {
    lineItems,
    subtotal,
    discount,
    total,
    vat: Math.round(vat * 10) / 10, // Round to 1 decimal place
  };
}

/**
 * Get main products by product type
 */
export function getMainProductsByType(productType: string): MainProduct[] {
  const products: Record<string, MainProduct[]> = {
    'car': [
      {
        id: 'car-whole',
        name: 'Hele bilen',
        description: 'Komplet rengøring af din bil - både indvendigt og udvendigt med professionel finish',
        price: 849,
        duration: 120,
        image: '/images/car-whole.jpg',
        productType: 'car',
        category: { id: 'car-main', name: 'Bil Hovedservice', slug: 'car-main' }
      },
      {
        id: 'car-inside',
        name: 'Indvendig',
        description: 'Grundig rengøring af bilens indre - sæder, gulvtæpper, instrumentbord og alle interne overflader',
        price: 599,
        duration: 90,
        image: '/images/car-inside.jpg',
        productType: 'car',
        category: { id: 'car-main', name: 'Bil Hovedservice', slug: 'car-main' }
      },
      {
        id: 'car-gold',
        name: 'Gold Package',
        description: 'Vores premium service med detailing, voksbehandling og beskyttelse af alle overflader',
        price: 2616,
        duration: 180,
        image: '/images/car-gold.jpg',
        productType: 'car',
        category: { id: 'car-premium', name: 'Premium Bil', slug: 'car-premium' }
      }
    ],
    'baby-trolley': [
      {
        id: 'trolley-complete',
        name: 'Komplet barnevogn',
        description: 'Grundig rengøring og desinfektion af barnevogn - sikker for baby',
        price: 299,
        duration: 45,
        image: '/images/trolley-complete.jpg',
        productType: 'baby-trolley',
        category: { id: 'trolley-main', name: 'Barnevogn Service', slug: 'trolley-main' }
      }
    ],
    'motorcycle': [
      {
        id: 'bike-complete',
        name: 'Komplet motorcykel',
        description: 'Professionel rengøring og polering af motorcykel',
        price: 449,
        duration: 75,
        image: '/images/bike-complete.jpg',
        productType: 'motorcycle',
        category: { id: 'bike-main', name: 'Motorcykel Service', slug: 'bike-main' }
      }
    ],
    'yacht': [
      {
        id: 'yacht-complete',
        name: 'Båd rengøring',
        description: 'Komplet rengøring af båd - både dæk og kahyt',
        price: 1299,
        duration: 240,
        image: '/images/yacht-complete.jpg',
        productType: 'yacht',
        category: { id: 'yacht-main', name: 'Båd Service', slug: 'yacht-main' }
      }
    ]
  };
  
  return products[productType] || [];
}

/**
 * Get addons by product type
 */
export function getAddonsByType(productType: string): AddonSelection[] {
  const addons: Record<string, AddonSelection[]> = {
    'car': [
      {
        addon: { 
          id: 'pet-hair', 
          name: 'Fjernelse af hundehår', 
          price: 199, 
          type: 'boolean',
          description: 'Specialbehandling for fjernelse af kæledyrshår',
          productType: 'car'
        },
        selected: false,
        quantity: 1,
      },
      {
        addon: { 
          id: 'leather-care', 
          name: 'Læderpleje', 
          price: 179, 
          type: 'boolean',
          description: 'Professionel pleje og behandling af læder',
          productType: 'car'
        },
        selected: false,
        quantity: 1,
      },
      {
        addon: { 
          id: 'deep-seat', 
          name: 'Dybdegående sæderens', 
          unitPrice: 99, 
          type: 'quantity', 
          min: 1, 
          max: 7,
          description: 'Intensiv rengøring af bilsæder',
          productType: 'car'
        },
        selected: false,
        quantity: 1,
      },
      {
        addon: { 
          id: 'tire-shine', 
          name: 'Dækshine', 
          price: 99, 
          type: 'boolean',
          description: 'Behandling for blanke og beskyttede dæk',
          productType: 'car'
        },
        selected: false,
        quantity: 1,
      },
    ],
    'baby-trolley': [
      {
        addon: { 
          id: 'disinfection', 
          name: 'Extra desinfektion', 
          price: 79, 
          type: 'boolean',
          description: 'Ekstra desinfektion med babysikre midler',
          productType: 'baby-trolley'
        },
        selected: false,
        quantity: 1,
      }
    ],
    'motorcycle': [
      {
        addon: { 
          id: 'chain-clean', 
          name: 'Kæderens', 
          price: 89, 
          type: 'boolean',
          description: 'Rengøring og smøring af motorcykelkæde',
          productType: 'motorcycle'
        },
        selected: false,
        quantity: 1,
      }
    ],
    'yacht': [
      {
        addon: { 
          id: 'deck-wax', 
          name: 'Dæk voksbehandling', 
          price: 399, 
          type: 'boolean',
          description: 'Beskyttende voksbehandling af dæk',
          productType: 'yacht'
        },
        selected: false,
        quantity: 1,
      }
    ]
  };
  
  return addons[productType] || [];
}

/**
 * Get default product types
 */
export function getDefaultProductTypes() {
  return [
    { id: 'car', name: 'Bil', type: 'car' as const, selected: false },
    { id: 'baby-trolley', name: 'Barnevogn', type: 'baby-trolley' as const, selected: false },
    { id: 'motorcycle', name: 'Motorcykel', type: 'motorcycle' as const, selected: false },
    { id: 'yacht', name: 'Båd', type: 'yacht' as const, selected: false },
  ];
}

/**
 * Create a new product booking with default selections
 */
export function createDefaultProductBooking(id: string, productType: string = 'car'): ProductBooking {
  const productTypes = getDefaultProductTypes();
  const selectedProductType = productTypes.find(p => p.type === productType);
  const mainProducts = getMainProductsByType(productType);
  const addons = getAddonsByType(productType);
  
  return {
    id,
    productType: selectedProductType ? { ...selectedProductType, selected: true } : null,
    mainProduct: mainProducts.length > 0 ? mainProducts[0] : null, // Auto-select first main product
    addons,
    vehicleDetails: productType === 'car' ? { selectedCar: null } : undefined,
    subtotal: 0,
    discount: 0,
  };
}

/**
 * Get predefined time slots
 */
export function getTimeSlots() {
  return [
    { id: 'morning', label: '08:00 - 12:00', startTime: '08:00', endTime: '12:00' },
    { id: 'midday', label: '12:00 - 15:00', startTime: '12:00', endTime: '15:00' },
    { id: 'afternoon', label: '15:00 - 19:00', startTime: '15:00', endTime: '19:00' },
  ];
}
