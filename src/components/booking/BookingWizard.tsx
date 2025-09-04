'use client';

import { useBookingStore } from '@/store/booking';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import ServiceSelection from './steps/ServiceSelection';
import DateTimeSelection from './steps/DateTimeSelection';
import VehicleSelection from './steps/VehicleSelection';
import CustomerInfoForm from './steps/CustomerInfoForm';
import BookingSummary from './steps/BookingSummary';

const steps = [
  { id: 'service', name: 'Service', description: 'Vælg din service' },
  { id: 'datetime', name: 'Tid', description: 'Vælg dato og tid' },
  { id: 'vehicle', name: 'Køretøj', description: 'Vælg dit køretøj' },
  { id: 'customer', name: 'Oplysninger', description: 'Dine kontaktoplysninger' },
  { id: 'summary', name: 'Bekræft', description: 'Gennemse og bekræft' },
];

export default function BookingWizard() {
  const { data: session, status } = useSession();
  const {
    currentStep,
    user,
    isAuthenticated,
    nextStep,
    previousStep,
    canProceed,
    isLoading,
    setUser,
    prePopulateFromUser,
  } = useBookingStore();

  // Update authentication state when session changes
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    
    if (session?.user && !user) {
      // User just logged in or session restored
      setUser(session.user);
      prePopulateFromUser(session.user);
    } else if (!session?.user && user) {
      // User logged out
      setUser(null);
    }
  }, [session, status, user, setUser, prePopulateFromUser]);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return <ServiceSelection />;
      case 'datetime':
        return <DateTimeSelection />;
      case 'vehicle':
        return <VehicleSelection />;
      case 'customer':
        return <CustomerInfoForm />;
      case 'summary':
        return <BookingSummary />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step Progress */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Book Service</h1>
              <span className="text-sm text-gray-500">
                Trin {currentStepIndex + 1} af {steps.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index <= currentStepIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Step Label (hidden on mobile) */}
                    <div className="hidden sm:block ml-2 mr-4">
                      <p className={`text-sm font-medium ${
                        index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                    
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 sm:mx-4 rounded ${
                          index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Step Content */}
          <div className="p-6 sm:p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 px-6 sm:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentStepIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Tilbage
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className={`flex items-center px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  canProceed() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Indlæser...
                  </div>
                ) : currentStepIndex === steps.length - 1 ? (
                  'Bekræft Booking'
                ) : (
                  <>
                    Næste
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
