/**
 * OptiPulse - Utility Functions and Constants
 * Shared utilities for UI components and data formatting
 */

/**
 * Department definitions
 */
export const departments = [
  { value: 'IT', label: 'IT' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finanțe' },
  { value: 'Operations', label: 'Operațiuni' },
];

/**
 * User role definitions
 */
export const userRoles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'Utilizator' },
];

/**
 * Vacation/Leave type definitions
 */
export const vacationTypes = [
  { value: 'odihna', label: 'Odihnă' },
  { value: 'medical', label: 'Medical' },
  { value: 'fara_plata', label: 'Fără Plată' },
];

/**
 * Format a number as currency (RON/EUR)
 * @param amount The amount to format
 * @param currency Currency code (default: EUR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR'
): string {
  const formatter = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
}

/**
 * Format a date string
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Get status color classes based on status value
 * @param status The status value
 * @returns CSS class string for badge styling
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'aprobat':
    case 'approved':
    case 'aprobate':
      return 'bg-green-100 text-green-800';
    case 'respins':
    case 'rejected':
    case 'respinse':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'in_progress':
    case 'inprogress':
      return 'bg-orange-100 text-orange-600';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'trimis':
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'activ':
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactiv':
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Parse and validate phone number
 * @param phoneString The phone string to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidPhone(phoneString: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-()]+$/;
  return phoneRegex.test(phoneString);
}

/**
 * Parse and validate email
 * @param emailString The email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(emailString: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailString);
}

/**
 * Generate avatar initials from full name
 * @param name The full name
 * @returns Avatar initials (2 characters)
 */
export function getAvatarInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
