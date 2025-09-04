import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { optionalAuth } from '@/lib/auth/api-middleware';

// Schema for EnhancedBookingPage format
const enhancedBookingSchema = z.object({
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.object({
      street: z.string(),
      postalCode: z.string(),
      city: z.string(),
    }),
  }),
  serviceId: z.string(),
  vehicleInfo: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
    color: z.string(),
    licensePlate: z.string().optional(),
  }),
  selectedDateTime: z.string(),
  selectedExtras: z.array(z.any()).optional(),
  pricing: z.object({
    lineItems: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      productId: z.string(),
      type: z.string(),
    })),
    subtotal: z.number(),
    discount: z.number(),
    total: z.number(),
    vat: z.number(),
  }),
  specialRequests: z.string().optional(),
});

// Schema for BookingWizard format (from store)
const wizardBookingSchema = z.object({
  serviceId: z.string(),
  extras: z.array(z.any()).optional(),
  vehicleId: z.string(),
  scheduledAt: z.string(),
  duration: z.number(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  location: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  totalPrice: z.number(),
  notes: z.string().optional(),
  companyId: z.string().optional(),
});

async function createBooking(request: NextRequest & { user?: { id: string; email: string; name: string; role: any; companyId?: string } }) {
  try {
    const body = await request.json();
    console.log('Received booking data:', JSON.stringify(body, null, 2));
    
    // Check if user is authenticated
    const isAuthenticated = !!request.user;
    const userId = request.user?.id;
    const userCompanyId = request.user?.companyId;
    
    console.log('Authentication status:', { isAuthenticated, userId, userCompanyId });

    let validatedData;
    let dataFormat: 'enhanced' | 'wizard';
    
    // Try to detect which format we're dealing with
    if (body.customerInfo && body.vehicleInfo && body.selectedDateTime && body.pricing) {
      // This looks like EnhancedBookingPage format
      validatedData = enhancedBookingSchema.parse(body);
      dataFormat = 'enhanced';
      console.log('Detected EnhancedBookingPage format');
    } else if (body.customer && body.location && body.scheduledAt && body.totalPrice) {
      // This looks like BookingWizard format
      validatedData = wizardBookingSchema.parse(body);
      dataFormat = 'wizard';
      console.log('Detected BookingWizard format');
    } else {
      throw new Error('Unknown data format - unable to parse booking data');
    }

    console.log('Validation successful!');

    let createdBooking;

    if (dataFormat === 'wizard') {
      // Handle BookingWizard format data
      const wizardData = validatedData as z.infer<typeof wizardBookingSchema>;
      
      let customer;
      
      if (isAuthenticated && userId) {
        // Use authenticated user
        customer = await prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (!customer) {
          throw new Error('Authenticated user not found');
        }
        
        // Optionally update user info from booking data
        customer = await prisma.user.update({
          where: { id: userId },
          data: {
            name: wizardData.customer.name || customer.name,
            phone: wizardData.customer.phone || customer.phone,
          },
        });
      } else {
        // Create or find guest customer
        customer = await prisma.user.upsert({
          where: { email: wizardData.customer.email },
          update: {
            name: wizardData.customer.name,
            phone: wizardData.customer.phone,
          },
          create: {
            email: wizardData.customer.email,
            name: wizardData.customer.name,
            phone: wizardData.customer.phone,
            role: 'CUSTOMER',
          },
        });
      }

      // Use authenticated user's company if available, otherwise use provided or default
      const bookingCompanyId = userCompanyId || wizardData.companyId || 'default-company';

      // Create location
      const location = await prisma.location.create({
        data: {
          name: wizardData.location.name,
          address: wizardData.location.address,
          city: wizardData.location.city,
          postalCode: wizardData.location.postalCode,
          country: wizardData.location.country,
          companyId: bookingCompanyId,
        },
      });

      // Create or find vehicle
      const vehicle = await prisma.customerVehicle.create({
        data: {
          customerId: customer.id,
          brandId: 'toyota-brand', // Use seeded brand
          modelId: 'corolla-model', // Use seeded model
          year: 2020, // Default since not provided
          color: 'Unknown',
          licensePlate: '',
          companyId: bookingCompanyId,
        },
      });

      // Create booking
      createdBooking = await prisma.booking.create({
        data: {
          scheduledAt: new Date(wizardData.scheduledAt),
          duration: wizardData.duration,
          totalPrice: wizardData.totalPrice,
          notes: wizardData.notes || '',
          companyId: bookingCompanyId,
          customerId: customer.id,
          locationId: location.id,
          vehicleId: vehicle.id,
          status: 'PENDING',
        },
      });

    } else {
      // Handle EnhancedBookingPage format data  
      const enhancedData = validatedData as z.infer<typeof enhancedBookingSchema>;
      
      let customer;
      
      if (isAuthenticated && userId) {
        // Use authenticated user
        customer = await prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (!customer) {
          throw new Error('Authenticated user not found');
        }
        
        // Optionally update user info from booking data
        customer = await prisma.user.update({
          where: { id: userId },
          data: {
            name: enhancedData.customerInfo.name || customer.name,
            phone: enhancedData.customerInfo.phone || customer.phone,
          },
        });
      } else {
        // Create or find guest customer
        customer = await prisma.user.upsert({
          where: { email: enhancedData.customerInfo.email },
          update: {
            name: enhancedData.customerInfo.name,
            phone: enhancedData.customerInfo.phone,
          },
          create: {
            email: enhancedData.customerInfo.email,
            name: enhancedData.customerInfo.name,
            phone: enhancedData.customerInfo.phone,
            role: 'CUSTOMER',
          },
        });
      }

      // Use authenticated user's company if available
      const enhancedBookingCompanyId = userCompanyId || 'default-company';

      // Create location from customer address
      const location = await prisma.location.create({
        data: {
          name: `${enhancedData.customerInfo.name}'s Location`,
          address: enhancedData.customerInfo.address.street,
          city: enhancedData.customerInfo.address.city,
          postalCode: enhancedData.customerInfo.address.postalCode,
          country: 'Denmark',
          companyId: enhancedBookingCompanyId,
        },
      });

      // Create vehicle from vehicle info
      const vehicle = await prisma.customerVehicle.create({
        data: {
          customerId: customer.id,
          brandId: 'toyota-brand', // Use seeded brand
          modelId: 'corolla-model', // Use seeded model
          year: enhancedData.vehicleInfo.year,
          color: enhancedData.vehicleInfo.color,
          licensePlate: enhancedData.vehicleInfo.licensePlate || '',
          companyId: enhancedBookingCompanyId,
        },
      });

      // Create booking
      createdBooking = await prisma.booking.create({
        data: {
          scheduledAt: new Date(enhancedData.selectedDateTime),
          duration: 120, // Default duration
          totalPrice: enhancedData.pricing.total,
          notes: enhancedData.specialRequests || '',
          companyId: enhancedBookingCompanyId,
          customerId: customer.id,
          locationId: location.id,
          vehicleId: vehicle.id,
          status: 'PENDING',
        },
      });
    }

    console.log(`Created booking in database with ID: ${createdBooking.id}`);
    
    // Return success response with real booking ID
    return NextResponse.json(
      { 
        success: true, 
        bookingId: createdBooking.id,
        booking: { id: createdBooking.id }, // For compatibility with store expectations
        message: 'Booking created successfully',
        format: dataFormat,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Export with optional authentication middleware
export const POST = optionalAuth(createBooking);
