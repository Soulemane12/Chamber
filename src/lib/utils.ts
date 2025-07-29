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
  atmos: {
    name: "ATMOS Hyperbaric",
    address: "166 laurel rd, east north NY, 11731",
    phone: "+1 (646) 262-8794",
    email: "info@atmoshyperbaric.com",
    owner: "ATMOS Hyperbaric",
    features: [
      "Free parking available",
      "Private changing rooms",
      "Complimentary refreshments",
      "WiFi and entertainment options during sessions"
    ],
    description: "Our state-of-the-art hyperbaric oxygen therapy center features premium amenities in a comfortable environment.",
    note: "Please arrive 15 minutes before your scheduled appointment.",
    hours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    imageUrl: "/HBOT.jpg"
  }
};

/**
 * Get location data by location ID
 */
export function getLocationData(locationId: 'atmos' | null) {
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