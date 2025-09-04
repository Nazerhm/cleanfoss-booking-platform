// Form validation utilities and schemas

import { FormErrors, Customer, Schedule, Address, Consents } from './types';

/**
 * Validate email address (basic RFC validation)
 */
export function validateEmail(email: string): string | null {
  if (!email) return 'E-mail er påkrævet';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Indtast en gyldig e-mail adresse';
  }
  
  return null;
}

/**
 * Validate Danish phone number
 */
export function validatePhone(phone: string): string | null {
  if (!phone) return 'Telefonnummer er påkrævet';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check for valid Danish phone number (8 digits, or 10 with country code)
  if (digits.length === 8) {
    return null; // Valid domestic format
  } else if (digits.length === 10 && digits.startsWith('45')) {
    return null; // Valid international format
  }
  
  return 'Indtast et gyldigt dansk telefonnummer (8 cifre)';
}

/**
 * Validate Danish postal code
 */
export function validatePostalCode(postalCode: string): string | null {
  if (!postalCode) return 'Postnummer er påkrævet';
  
  const digits = postalCode.replace(/\D/g, '');
  if (digits.length !== 4) {
    return 'Postnummer skal være 4 cifre';
  }
  
  return null;
}

/**
 * Validate time range (end must be after start)
 */
export function validateTimeRange(startTime: string, endTime: string): string | null {
  if (!startTime) return 'Starttidspunkt er påkrævet';
  if (!endTime) return 'Sluttidspunkt er påkrævet';
  
  // Convert to minutes for comparison
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  if (endMinutes <= startMinutes) {
    return 'Sluttidspunkt skal være efter starttidspunkt';
  }
  
  return null;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} er påkrævet`;
  }
  return null;
}

/**
 * Validate customer information
 */
export function validateCustomer(customer: Customer): FormErrors {
  const errors: FormErrors = {};
  
  const nameError = validateRequired(customer.name, 'Navn');
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(customer.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(customer.phone);
  if (phoneError) errors.phone = phoneError;
  
  return errors;
}

/**
 * Validate schedule information
 */
export function validateSchedule(schedule: Schedule): FormErrors {
  const errors: FormErrors = {};
  
  const dateError = validateRequired(schedule.date, 'Dato');
  if (dateError) errors.date = dateError;
  
  // Only validate start time - end time is optional for booking system
  if (!schedule.time) {
    errors.time = 'Starttidspunkt er påkrævet';
  }
  
  // Only validate time range if both times are provided
  if (schedule.time && schedule.customEndTime) {
    const timeError = validateTimeRange(schedule.time, schedule.customEndTime);
    if (timeError) {
      errors.time = timeError;
      errors.customEndTime = timeError;
    }
  }
  
  return errors;
}

/**
 * Validate address information
 */
export function validateAddress(address: Address): FormErrors {
  const errors: FormErrors = {};
  
  const streetError = validateRequired(address.street, 'Adresse');
  if (streetError) errors.street = streetError;
  
  const postalCodeError = validatePostalCode(address.postalCode);
  if (postalCodeError) errors.postalCode = postalCodeError;
  
  const cityError = validateRequired(address.city, 'By');
  if (cityError) errors.city = cityError;
  
  return errors;
}

/**
 * Validate consents
 */
export function validateConsents(consents: Consents): FormErrors {
  const errors: FormErrors = {};
  
  if (!consents.terms) {
    errors.terms = 'Du skal acceptere handelsbetingelserne for at fortsætte';
  }
  
  return errors;
}

/**
 * Validate complete booking form
 */
export function validateBookingForm(
  customer: Customer,
  schedule: Schedule,
  address: Address,
  consents: Consents
): FormErrors {
  return {
    ...validateCustomer(customer),
    ...validateSchedule(schedule),
    ...validateAddress(address),
    ...validateConsents(consents),
  };
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get first error field for scroll-to functionality
 */
export function getFirstErrorField(errors: FormErrors): string | null {
  const fields = Object.keys(errors);
  return fields.length > 0 ? fields[0] : null;
}
