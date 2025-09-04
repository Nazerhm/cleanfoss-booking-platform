import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Confirming payment for:', body);

    // Validate input
    const validatedData = confirmPaymentSchema.parse(body);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(validatedData.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment has not succeeded',
          status: paymentIntent.status,
        },
        { status: 400 }
      );
    }

    // Update booking status and create payment record
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const booking = await tx.booking.update({
        where: { id: validatedData.bookingId },
        data: { status: 'CONFIRMED' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          amount: paymentIntent.amount / 100, // Convert from øre to DKK
          currency: paymentIntent.currency.toUpperCase(),
          paymentMethod: 'CARD',
          transactionId: paymentIntent.id,
          status: 'COMPLETED',
          processedAt: new Date(),
          bookingId: validatedData.bookingId,
          companyId: booking.companyId,
        },
      });

      return { booking, payment };
    });

    console.log('Payment confirmed and booking updated:', result.booking.id);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      payment: result.payment,
      message: 'Payment confirmed successfully',
    });

  } catch (error) {
    console.error('Error confirming payment:', error);

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
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      },
      { status: 500 }
    );
  }
}
