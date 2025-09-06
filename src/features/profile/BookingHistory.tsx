'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  duration: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  services: Array<{
    id?: string;
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  vehicle: {
    id: string;
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  } | null;
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

interface BookingHistoryData {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function BookingHistory() {
  const [bookingData, setBookingData] = useState<BookingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/user/bookings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();
      if (result.success) {
        setBookingData(result.data);
      } else {
        setError('Failed to load booking history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Afventer';
      case 'CONFIRMED':
        return 'Bekræftet';
      case 'IN_PROGRESS':
        return 'I gang';
      case 'COMPLETED':
        return 'Fuldført';
      case 'CANCELLED':
        return 'Annulleret';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
    }).format(price);
  };

  if (loading && !bookingData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fejl ved indlæsning</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBookings}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Prøv igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Bookinghistorik</h3>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Filter efter status:
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Alle</option>
              <option value="PENDING">Afventer</option>
              <option value="CONFIRMED">Bekræftet</option>
              <option value="IN_PROGRESS">I gang</option>
              <option value="COMPLETED">Fuldført</option>
              <option value="CANCELLED">Annulleret</option>
            </select>
          </div>
        </div>

        {!bookingData || bookingData.bookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen bookinger fundet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter ? 'Ingen bookinger matcher det valgte filter.' : 'Du har ikke foretaget nogen bookinger endnu.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingData.bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Booking #{booking.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {format(new Date(booking.scheduledAt), 'PPp', { locale: da })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Varighed: {Math.floor(booking.duration / 60)}t {booking.duration % 60}m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Oprettet {format(new Date(booking.createdAt), 'PP', { locale: da })}
                    </p>
                  </div>
                </div>

                {/* Services */}
                {booking.services.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Ydelser:</h4>
                    <div className="space-y-1">
                      {booking.services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {service.name || 'Ukendt ydelse'} {service.quantity > 1 && `(${service.quantity}x)`}
                          </span>
                          <span className="font-medium">
                            {formatPrice(service.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle */}
                {booking.vehicle && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Køretøj:</h4>
                    <p className="text-sm text-gray-600">
                      {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.color})
                      {booking.vehicle.licensePlate && ` - ${booking.vehicle.licensePlate}`}
                    </p>
                  </div>
                )}

                {/* Location */}
                {booking.location && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Lokation:</h4>
                    <p className="text-sm text-gray-600">
                      {booking.location.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.location.address}, {booking.location.postalCode} {booking.location.city}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Noter:</h4>
                    <p className="text-sm text-gray-600">{booking.notes}</p>
                  </div>
                )}

                {/* Payment Status */}
                {booking.payments.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Betalingsstatus:</h4>
                    <div className="flex items-center space-x-2">
                      {booking.payments.map((payment, index) => (
                        <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          payment.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatPrice(payment.amount)} - {payment.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {bookingData && bookingData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forrige
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(bookingData.pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === bookingData.pagination.totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Næste
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Viser{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * bookingData.pagination.limit + 1}
                      </span>{' '}
                      til{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * bookingData.pagination.limit, bookingData.pagination.totalCount)}
                      </span>{' '}
                      af{' '}
                      <span className="font-medium">{bookingData.pagination.totalCount}</span> resultater
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Forrige</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, bookingData.pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(bookingData.pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === bookingData.pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Næste</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && bookingData && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
