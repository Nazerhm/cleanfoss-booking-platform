'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  bookingId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({ 
  amount, 
  currency, 
  customerEmail, 
  customerName, 
  bookingId,
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, [amount, currency, customerEmail]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          customerEmail,
          customerName,
          bookingId,
          description: `CleanFoss booking - ${customerName}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        onError(result.error || 'Failed to initialize payment');
      }
    } catch (error) {
      onError('Network error - please try again');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: customerName,
          email: customerEmail,
        },
      },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Betalingsoplysninger
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="text-xl font-bold">
            {amount.toFixed(2)} {currency.toUpperCase()}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? 'Behandler betaling...' : `Betal ${amount.toFixed(2)} ${currency.toUpperCase()}`}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>Sikker betaling leveret af Stripe</p>
        <p>Dine betalingsoplysninger er krypteret og sikre</p>
      </div>
    </form>
  );
}

interface StripePaymentProps {
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  bookingId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function StripePayment({ 
  amount, 
  currency = 'dkk', 
  customerEmail, 
  customerName, 
  bookingId,
  onSuccess, 
  onError 
}: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        currency={currency}
        customerEmail={customerEmail}
        customerName={customerName}
        bookingId={bookingId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
