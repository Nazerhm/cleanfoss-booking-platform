import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('dkk'),
  bookingId: z.string().optional(),
  customerEmail: z.string().email('Invalid email format'),
  customerName: z.string().min(1, 'Customer name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating payment intent for:', body);

    // Validate input
    const validatedData = createPaymentIntentSchema.parse(body);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.amount * 100), // Convert to øre (smallest Danish currency unit)
      currency: validatedData.currency,
      metadata: {
        bookingId: validatedData.bookingId || '',
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
      },
      description: validatedData.description || `CleanFoss booking payment`,
      receipt_email: validatedData.customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      },
      { status: 500 }
    );
  }
}
