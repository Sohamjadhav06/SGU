/**
 * Currency & Number Formatting Helpers for Indian Businesses (en-IN)
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const rounded = Math.round(amount * 100) / 100;
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatNumberIN(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}
