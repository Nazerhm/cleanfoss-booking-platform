import { NextRequest, NextResponse } from 'next/server';

// Vehicle type multipliers
const vehicleMultipliers = {
  CAR: 1.0,
  SUV: 1.3,
  VAN: 1.5,
  TRUCK: 1.8,
  MOTORCYCLE: 0.7,
};

// Mock service base prices
const servicePrices: Record<string, number> = {
  'service-1': 350, // Eksterior Vask
  'service-2': 400, // Interiør Rengøring
  'service-3': 750, // Premium Komplet
  'service-4': 450, // SUV Special
  'service-5': 200, // Express Vask
};

// Mock extras prices
const extrasPrices: Record<string, number> = {
  'extra-1': 75,   // Dækskum behandling
  'extra-2': 150,  // Motor rengøring
  'extra-3': 200,  // Læderbehandling
  'extra-4': 250,  // Ozonebehandling
  'extra-5': 500,  // Keramisk coating
  'extra-6': 100,  // Bagagerum rengøring
  'extra-7': 180,  // Undervogns rengøring
  'extra-8': 120,  // Tagboks rengøring
  'extra-9': 50,   // Hurtig voks
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, vehicleType = 'CAR', extras = [] } = body;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Get base price for service
    const basePrice = servicePrices[serviceId];
    if (!basePrice) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate vehicle multiplier
    const vehicleMultiplier = vehicleMultipliers[vehicleType as keyof typeof vehicleMultipliers] || 1.0;

    // Calculate extras price
    const extrasPrice = extras.reduce((total: number, extraId: string) => {
      const extraPrice = extrasPrices[extraId] || 0;
      return total + extraPrice;
    }, 0);

    // Calculate totals
    const adjustedBasePrice = Math.round(basePrice * vehicleMultiplier);
    const subtotal = adjustedBasePrice + extrasPrice;
    const vat = Math.round(subtotal * 0.25); // 25% Danish VAT
    const total = subtotal + vat;

    const pricing = {
      basePrice: adjustedBasePrice,
      extrasPrice,
      vehicleMultiplier,
      subtotal,
      vat,
      total,
      currency: 'DKK'
    };

    return NextResponse.json({
      success: true,
      pricing
    });

  } catch (error) {
    console.error('Pricing calculation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate pricing' 
      },
      { status: 500 }
    );
  }
}
