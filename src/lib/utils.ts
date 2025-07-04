import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and then processes them with tailwind-merge
 * to properly handle conflicting Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Generates a random string to use as an ID
 */
export function generateId(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Location data for the hyperbaric chamber centers
 */
export const locationData = {
  midtown: {
    name: "Midtown Biohack",
    address: "575 Madison Ave, 20th floor, New York, NY",
    phone: "+1 (646) 262-8794",
    email: "billydduc@gmail.com",
    owner: "Billy Duc",
  },
  conyers: {
    name: "Platinum Wellness Spa",
    address: "1900 Parker Rd SE, Conyers, GA 30094",
    phone: "+1 (646) 262-8794",
    email: "billydduc@gmail.com",
    owner: "Billy Duc",
  }
};

/**
 * Get location data by location ID
 */
export function getLocationData(locationId: 'midtown' | 'conyers' | null) {
  if (!locationId) return null;
  return locationData[locationId];
}

/**
 * Generate Google Maps URL from address
 */
export function getGoogleMapsUrl(address: string): string {
  // Encode the address for use in a URL
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${encodedAddress}`;
}

// Get the current site URL for proper redirects in different environments
export const getSiteUrl = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000';
  
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  
  // Make sure to include trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  return url;
}; 