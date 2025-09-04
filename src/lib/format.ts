// Currency and number formatting utilities for Danish locale

/**
 * Format a number as Danish currency (DKK)
 * Examples: 1377 → "1.377 kr.", 275.4 → "275,4 kr."
 */
export function formatDKK(amount: number): string {
  // Handle decimal comma and thousands separator for Danish locale
  const formatted = new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
  
  return `${formatted} kr.`;
}

/**
 * Format a decimal number with Danish locale (comma as decimal separator)
 */
export function formatDecimal(number: number, decimals: number = 1): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Parse a Danish formatted number string back to number
 */
export function parseDKKAmount(dkkString: string): number {
  // Remove "kr." and convert Danish format to number
  const cleanString = dkkString
    .replace(/\s*kr\.?/gi, '')
    .replace(/\./g, '') // Remove thousands separator
    .replace(/,/g, '.'); // Convert decimal comma to dot
  
  return parseFloat(cleanString) || 0;
}

/**
 * Format date as DD-MM-YYYY (Danish format)
 */
export function formatDateDK(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Convert DD-MM-YYYY to YYYY-MM-DD (for HTML date input)
 */
export function parseDateDK(dateString: string): string {
  if (!dateString) return '';
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const [day, month, year] = parts;
  if (day.length === 2 && month.length === 2 && year.length === 4) {
    return `${year}-${month}-${day}`;
  }
  
  return dateString;
}

/**
 * Format phone number for Danish locale
 */
export function formatDanishPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle international format
  if (digits.startsWith('45') && digits.length === 10) {
    return `+45 ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  
  // Handle domestic format
  if (digits.length === 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  
  return phone; // Return original if format not recognized
}

/**
 * Format date for Danish locale
 */
export function formatDanishDate(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time for Danish locale (24-hour format)
 */
export function formatDanishTime(time: string): string {
  if (!time) return '';
  
  // Ensure HH:MM format
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes?.padStart(2, '0') || '00'}`;
}
