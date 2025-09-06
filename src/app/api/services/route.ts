import { NextRequest, NextResponse } from 'next/server';

// Force dynamic route to prevent static generation issues
export const dynamic = 'force-dynamic'

// Mock services for demo purposes - Danish car cleaning services
const mockServices = [
  {
    id: 'service-1',
    name: 'Eksterior Vask',
    description: 'Grundig udvendig rengøring med håndvask, felgrengøring og voksbehandling. Perfekt til daglig vedligeholdelse.',
    price: 350,
    duration: 45,
    image: null,
    backgroundColor: '#3B82F6',
    status: 'ACTIVE',
    companyId: 'demo-company-id',
    categoryId: 'cat-exterior',
    category: {
      id: 'cat-exterior',
      name: 'Udvendig Rengøring',
      slug: 'exterior'
    },
    pricing: {
      basePrice: 350,
      baseDuration: 45,
      finalPrice: 350,
      finalDuration: 45
    },
    extras: [
      {
        id: 'extra-1',
        name: 'Dækskum behandling',
        description: 'Professionel dækbehandling for blanke dæk',
        price: 75,
        duration: 10
      },
      {
        id: 'extra-2',
        name: 'Motor rengøring',
        description: 'Grundig rengøring af motorrum',
        price: 150,
        duration: 20
      }
    ]
  },
  {
    id: 'service-2',
    name: 'Interiør Rengøring',
    description: 'Dyb rengøring af indvendige overflader, sæder, tæpper og instrumentbord. Inkluderer støvsugning og fugtrengøring.',
    price: 400,
    duration: 60,
    image: null,
    backgroundColor: '#10B981',
    status: 'ACTIVE',
    companyId: 'demo-company-id',
    categoryId: 'cat-interior',
    category: {
      id: 'cat-interior',
      name: 'Indvendig Rengøring',
      slug: 'interior'
    },
    pricing: {
      basePrice: 400,
      baseDuration: 60,
      finalPrice: 400,
      finalDuration: 60
    },
    extras: [
      {
        id: 'extra-3',
        name: 'Læderbehandling',
        description: 'Pleje og impregnering af læder sæder',
        price: 200,
        duration: 15
      },
      {
        id: 'extra-4',
        name: 'Ozonebehandling',
        description: 'Fjerner lugte og bakterier effektivt',
        price: 250,
        duration: 30
      }
    ]
  },
  {
    id: 'service-3',
    name: 'Premium Komplet',
    description: 'Vores mest omfattende service - både inde og ude. Inkluderer voks, polering, læderpleje og dybderengøring.',
    price: 750,
    duration: 120,
    image: null,
    backgroundColor: '#8B5CF6',
    status: 'ACTIVE',
    companyId: 'demo-company-id',
    categoryId: 'cat-premium',
    category: {
      id: 'cat-premium',
      name: 'Premium Service',
      slug: 'premium'
    },
    pricing: {
      basePrice: 750,
      baseDuration: 120,
      finalPrice: 750,
      finalDuration: 120
    },
    extras: [
      {
        id: 'extra-5',
        name: 'Keramisk coating',
        description: '6 måneders beskyttelse mod vejr og vind',
        price: 500,
        duration: 45
      },
      {
        id: 'extra-6',
        name: 'Bagagerum rengøring',
        description: 'Grundig rengøring af bagagerum',
        price: 100,
        duration: 15
      }
    ]
  },
  {
    id: 'service-4',
    name: 'SUV Special',
    description: 'Specialservice til store køretøjer og SUVer. Tilpasset større biler med ekstra tid og special udstyr.',
    price: 450,
    duration: 75,
    image: null,
    backgroundColor: '#F59E0B',
    status: 'ACTIVE',
    companyId: 'demo-company-id',
    categoryId: 'cat-suv',
    category: {
      id: 'cat-suv',
      name: 'SUV & Store Biler',
      slug: 'suv'
    },
    pricing: {
      basePrice: 450,
      baseDuration: 75,
      finalPrice: 450,
      finalDuration: 75
    },
    extras: [
      {
        id: 'extra-7',
        name: 'Undervogns rengøring',
        description: 'Fjerner salt og snavs fra undervogn',
        price: 180,
        duration: 25
      },
      {
        id: 'extra-8',
        name: 'Tagboks rengøring',
        description: 'Rengøring af tagboks og rails',
        price: 120,
        duration: 20
      }
    ]
  },
  {
    id: 'service-5',
    name: 'Express Vask',
    description: 'Hurtig udvendig vask og tørring. Perfekt når du har travlt men vil have en ren bil.',
    price: 200,
    duration: 25,
    image: null,
    backgroundColor: '#EF4444',
    status: 'ACTIVE',
    companyId: 'demo-company-id',
    categoryId: 'cat-express',
    category: {
      id: 'cat-express',
      name: 'Express Service',
      slug: 'express'
    },
    pricing: {
      basePrice: 200,
      baseDuration: 25,
      finalPrice: 200,
      finalDuration: 25
    },
    extras: [
      {
        id: 'extra-9',
        name: 'Hurtig voks',
        description: 'Spray-on voks for ekstra glans',
        price: 50,
        duration: 5
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    const search = request.nextUrl.searchParams.get('search');
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    // Filter services based on query parameters
    let filteredServices = mockServices;

    if (companyId && companyId !== 'demo-company-id') {
      // If requesting a different company, return empty for now
      filteredServices = [];
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }

    if (categoryId) {
      filteredServices = filteredServices.filter(service =>
        service.categoryId === categoryId
      );
    }

    return NextResponse.json({
      success: true,
      services: filteredServices,
      total: filteredServices.length,
    });

  } catch (error) {
    console.error('Services API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch services',
        services: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
