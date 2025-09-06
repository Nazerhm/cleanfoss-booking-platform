'use client';

import { useBookingStore, CustomerInfo } from '@/store/booking';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function CustomerInfoForm() {
  const { data: session } = useSession();
  const {
    customerInfo,
    isAuthenticated,
    shouldSaveToAccount,
    setCustomerInfo,
    setSaveToAccount,
    clearError,
    setError,
    errors,
  } = useBookingStore();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Show login prompt for guest users when they have entered some data
  useEffect(() => {
    const hasData = customerInfo.name || customerInfo.email || customerInfo.phone;
    if (hasData && !isAuthenticated && !showLoginPrompt) {
      setShowLoginPrompt(true);
    }
  }, [customerInfo, isAuthenticated, showLoginPrompt]);

  const handleInputChange = (field: string, value: string) => {
    let updatedInfo: Partial<CustomerInfo> = { ...customerInfo };
    
    if (field.includes('.')) {
      // Handle nested fields like address.street with proper typing
      const [parent, child] = field.split('.');
      if (parent === 'address') {
        updatedInfo.address = {
          street: '',
          city: '',
          postalCode: '',
          country: '',
          ...updatedInfo.address,
          [child]: value,
        };
      } else if (parent === 'preferences') {
        updatedInfo.preferences = {
          contactMethod: 'email',
          ...updatedInfo.preferences,
          [child]: value,
        };
      }
    } else {
      // Handle top-level fields with proper typing
      switch (field) {
        case 'name':
        case 'email':
        case 'phone':
          updatedInfo = { ...updatedInfo, [field]: value };
          break;
        default:
          // For any unknown fields, maintain type safety
          updatedInfo = { ...updatedInfo, [field]: value } as CustomerInfo;
      }
    }
    
    setCustomerInfo(updatedInfo);
    clearError(field);

    // Basic validation
    if (field === 'email' && value && !value.includes('@')) {
      setError(field, 'Indtast en gyldig email adresse');
    }
    if (field === 'phone' && value && !/^\d{8}$/.test(value.replace(/\s/g, ''))) {
      setError(field, 'Telefonnummer skal være 8 cifre');
    }
  };

  const handleLoginClick = () => {
    signIn(undefined, { 
      callbackUrl: window.location.href,
      redirect: false 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dine oplysninger
        </h2>
        <p className="text-gray-600">
          {isAuthenticated 
            ? 'Vi har udfyldt dine oplysninger baseret på din profil. Du kan ændre dem hvis nødvendigt.'
            : 'Indtast dine kontaktoplysninger og leveringsadresse.'
          }
        </p>
      </div>

      {/* Authentication status */}
      {isAuthenticated && session?.user && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <UserIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">
              Logget ind som {session.user.name || session.user.email}
            </p>
            <p className="text-green-600 text-sm">
              Dine oplysninger er automatisk udfyldt
            </p>
          </div>
        </div>
      )}

      {/* Login prompt for guests */}
      {showLoginPrompt && !isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-1">
              <h3 className="text-blue-800 font-medium mb-1">
                Log ind for at spare tid
              </h3>
              <p className="text-blue-600 text-sm mb-3">
                Få automatisk udfyldt dine oplysninger og gem bookingen til din konto
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleLoginClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Log ind
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Fortsæt som gæst
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Information Form */}
      <form className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
            Personlige oplysninger
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Fulde navn *
              </label>
              <input
                type="text"
                id="name"
                value={customerInfo.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Indtast dit fulde navn"
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefonnummer *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={customerInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="12 34 56 78"
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email adresse *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={customerInfo.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="din@email.dk"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
            Leveringsadresse
          </h3>
          
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Gade og husnummer *
            </label>
            <input
              type="text"
              id="street"
              value={customerInfo.address?.street || ''}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Eksempel Vej 123"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postnummer *
              </label>
              <input
                type="text"
                id="postalCode"
                value={customerInfo.address?.postalCode || ''}
                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234"
                maxLength={4}
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                By *
              </label>
              <input
                type="text"
                id="city"
                value={customerInfo.address?.city || ''}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="København"
                required
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Præferencer
          </h3>
          
          <div>
            <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Foretrukken kontaktmetode
            </label>
            <select
              id="contactMethod"
              value={customerInfo.preferences?.contactMethod || 'email'}
              onChange={(e) => handleInputChange('preferences.contactMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Både email og SMS</option>
            </select>
          </div>

          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Særlige instruktioner (valgfrit)
            </label>
            <textarea
              id="specialInstructions"
              value={customerInfo.preferences?.specialInstructions || ''}
              onChange={(e) => handleInputChange('preferences.specialInstructions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="F.eks. parkeringsforhold, nøgleplacering, specielle ønsker..."
            />
          </div>
        </div>

        {/* Save to account option for guests */}
        {!isAuthenticated && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveToAccount"
                checked={shouldSaveToAccount}
                onChange={(e) => setSaveToAccount(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="saveToAccount" className="ml-2 block text-sm text-gray-700">
                Opret konto og gem denne booking til fremtidig reference
              </label>
            </div>
            <p className="text-gray-500 text-xs mt-1 ml-6">
              Du vil modtage en email med mulighed for at sætte kodeord
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
