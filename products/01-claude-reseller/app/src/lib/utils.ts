import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes without conflicts.
 * Drop-in replacement for clsx when Tailwind classes may collide.
 * Example: cn("px-4 py-2", condition && "py-4") → "px-4 py-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a USD price for display.
 * Always shows 0 decimal places for whole numbers, 2 otherwise.
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toFixed(0)}`
    : `$${dollars.toFixed(2)}`;
}

/**
 * Format a price in dollars directly (not cents).
 */
export function formatPriceDollars(dollars: number): string {
  return dollars % 1 === 0
    ? `$${dollars.toFixed(0)}`
    : `$${dollars.toFixed(2)}`;
}
