// Unit tests for validation utilities

import { 
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateTimeRange,
  validateCustomer,
  validateSchedule,
  validateAddress,
  validateConsents
} from '../src/lib/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name@domain.co.uk')).toBeNull();
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('')).toBe('E-mail er påkrævet');
      expect(validateEmail('invalid-email')).toBe('Indtast en gyldig e-mail adresse');
      expect(validateEmail('test@')).toBe('Indtast en gyldig e-mail adresse');
    });
  });

  describe('validatePhone', () => {
    it('validates Danish phone numbers', () => {
      expect(validatePhone('12345678')).toBeNull(); // 8 digits
      expect(validatePhone('4512345678')).toBeNull(); // with country code
      expect(validatePhone('+45 12 34 56 78')).toBeNull(); // formatted
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('')).toBe('Telefonnummer er påkrævet');
      expect(validatePhone('1234567')).toBe('Indtast et gyldigt dansk telefonnummer (8 cifre)');
      expect(validatePhone('123456789')).toBe('Indtast et gyldigt dansk telefonnummer (8 cifre)');
    });
  });

  describe('validatePostalCode', () => {
    it('validates Danish postal codes', () => {
      expect(validatePostalCode('1234')).toBeNull();
      expect(validatePostalCode('9999')).toBeNull();
    });

    it('rejects invalid postal codes', () => {
      expect(validatePostalCode('')).toBe('Postnummer er påkrævet');
      expect(validatePostalCode('123')).toBe('Postnummer skal være 4 cifre');
      expect(validatePostalCode('12345')).toBe('Postnummer skal være 4 cifre');
    });
  });

  describe('validateTimeRange', () => {
    it('validates correct time ranges', () => {
      expect(validateTimeRange('08:00', '10:00')).toBeNull();
      expect(validateTimeRange('14:30', '16:45')).toBeNull();
    });

    it('rejects invalid time ranges', () => {
      expect(validateTimeRange('', '10:00')).toBe('Starttidspunkt er påkrævet');
      expect(validateTimeRange('08:00', '')).toBe('Sluttidspunkt er påkrævet');
      expect(validateTimeRange('10:00', '08:00')).toBe('Sluttidspunkt skal være efter starttidspunkt');
      expect(validateTimeRange('10:00', '10:00')).toBe('Sluttidspunkt skal være efter starttidspunkt');
    });
  });

  describe('validateCustomer', () => {
    it('validates complete customer data', () => {
      const customer = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '12345678'
      };
      
      const errors = validateCustomer(customer);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('catches missing required fields', () => {
      const customer = {
        name: '',
        email: 'invalid-email',
        phone: '123'
      };
      
      const errors = validateCustomer(customer);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.phone).toBeDefined();
    });
  });

  describe('validateConsents', () => {
    it('requires terms acceptance', () => {
      const consents = {
        createAccount: false,
        marketing: false,
        terms: false
      };
      
      const errors = validateConsents(consents);
      expect(errors.terms).toBe('Du skal acceptere handelsbetingelserne for at fortsætte');
    });

    it('passes when terms are accepted', () => {
      const consents = {
        createAccount: false,
        marketing: false,
        terms: true
      };
      
      const errors = validateConsents(consents);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
