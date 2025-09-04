'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StripePayment from '@/components/payment/StripePayment';

interface BookingDetails {
  id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  pricing: {
    total: number;
  };
  service: {
    name: string;
  };
  vehicle: {
    make: string;
    model: string;
  };
  selectedDateTime: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const result = await response.json();

      if (result.success) {
        setBooking(result.booking);
      } else {
        setError('Kunne ikke finde booking detaljer');
      }
    } catch (error) {
      setError('Netværksfejl - prøv igen senere');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          bookingId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = '/booking/success';
      } else {
        setError('Betaling gennemført, men kunne ikke bekræfte booking. Kontakt support.');
      }
    } catch (error) {
      setError('Betaling gennemført, men kunne ikke bekræfte booking. Kontakt support.');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser booking detaljer...</p>
        </div>
      </div>
    );
  }

  if (error || !booking || !bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Fejl</h2>
          <p className="text-gray-600 mb-4">{error || 'Ugyldig booking ID'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tilbage til forsiden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Gennemfør Betaling
          </h1>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Booking Oversigt</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="text-gray-900">{booking.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Køretøj:</span>
                <span className="text-gray-900">{booking.vehicle.make} {booking.vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tidspunkt:</span>
                <span className="text-gray-900">
                  {new Date(booking.selectedDateTime).toLocaleDateString('da-DK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{booking.pricing.total.toFixed(2)} DKK</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Payment Form */}
          <StripePayment
            amount={booking.pricing.total}
            currency="dkk"
            customerEmail={booking.customerInfo.email}
            customerName={booking.customerInfo.name}
            bookingId={bookingId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  );
}
