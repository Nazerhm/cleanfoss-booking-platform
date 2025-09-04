'use client';

// Enhanced CleanFoss booking page with multi-product support

import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  BookingData, 
  ProductBooking, 
  FormErrors, 
  PricingSummary,
  Customer,
  Schedule,
  Address,
  Consents,
  ProductType,
  MainProduct
} from '../lib/types';
import { 
  calculatePricing, 
  createDefaultProductBooking,
  getDefaultProductTypes,
  getMainProductsByType,
  getAddonsByType 
} from '../lib/pricing';
import { 
  validateBookingForm, 
  hasValidationErrors, 
  getFirstErrorField 
} from '../lib/validation';

// Components
import ProductTypeSelector from '../components/ProductTypeSelector';
import MainProductCard from '../components/MainProductCard';
import CarSearch from '../components/CarSearch';
import AddonsGrid from '../components/AddonsGrid';
import CustomerForm from '../components/CustomerForm';
import EnhancedScheduleForm from '../components/EnhancedScheduleForm';
import AddressForm from '../components/AddressForm';
import ConsentsComponent from '../components/Consents';
import OrderSummary from '../components/OrderSummary';
import StickyBar from '../components/StickyBar';

export default function EnhancedBookingPage() {
  // Main booking state
  const [products, setProducts] = useState<ProductBooking[]>([
    createDefaultProductBooking('product-1', 'car')
  ]);
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: ''
  });
  
  const [schedule, setSchedule] = useState<Schedule>({
    date: '',
    time: '09:00',
    timeSlot: undefined,
    customStartTime: '',
    customEndTime: '',
    useCustomTime: false,
    notes: ''
  });
  
  const [address, setAddress] = useState<Address>({
    street: '',
    postalCode: '',
    city: ''
  });
  
  const [consents, setConsents] = useState<Consents>({
    terms: false,
    marketing: false,
    createAccount: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [pricing, setPricing] = useState<PricingSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available product types
  const productTypes = getDefaultProductTypes();

  // Calculate pricing whenever products change
  useEffect(() => {
    const newPricing = calculatePricing(products);
    setPricing(newPricing);
  }, [products]);

  // Add new product
  const addProduct = () => {
    if (products.length >= 25) return; // Max 25 products
    
    const newProduct = createDefaultProductBooking(`product-${products.length + 1}`, 'car');
    setProducts([...products, newProduct]);
  };

  // Add new car specifically
  const addCar = () => {
    if (products.length >= 25) return; // Max 25 products
    
    const carProducts = products.filter(p => p.productType?.type === 'car');
    const newProduct = createDefaultProductBooking(`product-${products.length + 1}`, 'car');
    setProducts([...products, newProduct]);
  };

  // Remove product
  const removeProduct = (productId: string) => {
    if (products.length <= 1) return; // Always keep at least one product
    setProducts(products.filter(p => p.id !== productId));
  };

  // Update product type
  const updateProductType = (productId: string, productType: ProductType) => {
    setProducts(products.map(product => {
      if (product.id !== productId) return product;
      
      const mainProducts = getMainProductsByType(productType.type);
      const addons = getAddonsByType(productType.type);
      
      return {
        ...product,
        productType,
        mainProduct: mainProducts.length > 0 ? mainProducts[0] : null,
        addons
      };
    }));
  };

  // Update main product selection
  const updateMainProduct = (productId: string, mainProduct: MainProduct) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, mainProduct }
        : product
    ));
  };

  // Update vehicle details
  const updateVehicleDetails = (productId: string, vehicleDetails: any) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, vehicleDetails }
        : product
    ));
  };

  // Update addon selection
  const updateAddonSelection = (productId: string, addonId: string, selected: boolean, quantity: number = 1) => {
    setProducts(products.map(product => {
      if (product.id !== productId) return product;
      
      return {
        ...product,
        addons: product.addons.map(addonSelection => 
          addonSelection.addon.id === addonId
            ? { ...addonSelection, selected, quantity }
            : addonSelection
        )
      };
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const bookingData: BookingData = {
      products,
      customer,
      schedule,
      address,
      consents,
      specialRequests: schedule.notes || ''
    };

    const validationErrors = validateBookingForm(customer, schedule, address, consents);
    
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      const firstErrorField = getFirstErrorField(validationErrors);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        errorElement?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare booking data for API
      const apiBookingData = {
        serviceId: products[0]?.mainProduct?.id || 'default-service',
        extras: products[0]?.addons?.filter(addon => addon.selected).map((addon: any) => addon.id) || [],
        vehicleId: 'default-vehicle', // TODO: Get from vehicle selection
        scheduledAt: schedule.date ? new Date(schedule.date).toISOString() : new Date().toISOString(),
        duration: 120, // 2 hours default
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        location: {
          name: `${customer.name} address`,
          address: address.street,
          city: address.city,
          postalCode: address.postalCode,
          country: 'Denmark',
        },
        totalPrice: pricing?.total || 0,
        notes: schedule.notes || '',
        companyId: 'default-company',
      };

      // Submit booking to API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBookingData),
      });

      const result = await response.json();

      if (result.success && result.bookingId) {
        // Redirect to payment page or show payment modal
        window.location.href = `/booking/payment?bookingId=${result.bookingId}`;
      } else {
        alert(`Booking fejl: ${result.error || 'Ukendt fejl'}`);
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      alert('Netværksfejl - prøv venligst igen senere.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductLabel = (index: number) => {
    if (index === 0) return '';
    return ` #${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bestil CleanFoss rengøring
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Professionel rengøring til din dør
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Products & Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Products Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dine produkter ({products.length})
                </h2>
                {products.length < 25 && (
                  <button
                    onClick={addProduct}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cleanfoss-blue"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Tilføj produkt
                  </button>
                )}
              </div>

              {/* Product Cards */}
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.productType?.name || 'Vælg produkttype'}{getProductLabel(index)}
                    </h3>
                    {products.length > 1 && (
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Fjern
                      </button>
                    )}
                  </div>

                  {/* Product Type Selection */}
                  <div className="mb-6">
                    <ProductTypeSelector
                      productTypes={productTypes}
                      selectedProductType={product.productType}
                      onSelectProductType={(productType) => updateProductType(product.id, productType)}
                    />
                  </div>

                  {/* Car Search for Cars - moved above main product selection */}
                  {product.productType?.type === 'car' && (
                    <div className="mb-6">
                      <CarSearch
                        selectedCar={product.vehicleDetails?.selectedCar || null}
                        onCarSelect={(car) => updateVehicleDetails(product.id, { 
                          selectedCar: car
                        })}
                      />
                    </div>
                  )}

                  {/* Main Product Selection */}
                  {product.productType && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Vælg hovedservice
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {getMainProductsByType(product.productType.type).map((mainProduct) => (
                          <MainProductCard
                            key={mainProduct.id}
                            product={mainProduct}
                            isSelected={product.mainProduct?.id === mainProduct.id}
                            onSelect={() => updateMainProduct(product.id, mainProduct)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Addons */}
                  {product.productType && product.addons.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Tilkøb (valgfrit)
                      </h4>
                      {/* Temporary simple addon display - needs updated AddonsGrid component */}
                      <div className="space-y-3">
                        {product.addons.map((addonSelection) => (
                          <div key={addonSelection.addon.id} className="flex items-center p-3 border rounded-lg">
                            {/* Image placeholder */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            
                            <div className="flex-1">
                              <span className="font-medium">{addonSelection.addon.name}</span>
                              {addonSelection.addon.description && (
                                <p className="text-sm text-gray-600">{addonSelection.addon.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {addonSelection.addon.price && (
                                <span className="text-sm font-medium">{addonSelection.addon.price} kr.</span>
                              )}
                              {addonSelection.addon.unitPrice && (
                                <span className="text-sm font-medium">{addonSelection.addon.unitPrice} kr./stk.</span>
                              )}
                              <input
                                type="checkbox"
                                checked={addonSelection.selected}
                                onChange={(e) => updateAddonSelection(product.id, addonSelection.addon.id, e.target.checked, addonSelection.quantity)}
                                className="h-4 w-4 text-cleanfoss-blue focus:ring-cleanfoss-blue border-gray-300 rounded"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Car Section - Separate section with different color */}
              {products.some(p => p.productType?.type === 'car') && products.length < 25 && (
                <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      Tilføj flere biler
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Har du flere biler der skal rengøres? Tilføj dem her.
                    </p>
                    <button
                      onClick={addCar}
                      className="inline-flex items-center px-6 py-3 border border-blue-600 shadow-sm text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors duration-200"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Tilføj bil #{products.filter(p => p.productType?.type === 'car').length + 1}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <CustomerForm 
                customer={customer}
                onChange={setCustomer}
                errors={errors}
              />
            </div>

            {/* Schedule & Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <EnhancedScheduleForm
                schedule={schedule}
                onScheduleChange={setSchedule}
              />
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AddressForm 
                address={address}
                onChange={setAddress}
                errors={errors}
              />
            </div>

            {/* Consents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ConsentsComponent
                consents={consents}
                onChange={setConsents}
                errors={errors}
              />
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {pricing && (
                <div className="space-y-4">
                  <OrderSummary 
                    pricing={pricing}
                    customer={customer}
                    schedule={schedule}
                    address={address}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !pricing || pricing.total <= 0}
                    className="
                      w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl
                      transition-colors duration-200 opacity-100 visible
                      focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-sm
                    "
                  >
                    {isSubmitting ? 'Behandler...' : 'Bestil nu'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="lg:hidden">
        {pricing && (
          <StickyBar
            pricing={pricing}
            onSubmit={handleSubmit}
            disabled={!pricing || pricing.total <= 0}
          />
        )}
      </div>
    </div>
  );
}
