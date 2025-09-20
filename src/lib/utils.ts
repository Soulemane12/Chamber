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
    address: "575 Madison Ave, 23rd Floor, New York, NY 10022",

    email: "billydduc@gmail.com",
    owner: "Billy Duc",
    features: [
      "Free parking validation available",
      "Private changing rooms with showers",
      "Complimentary refreshments",
      "WiFi and entertainment options during sessions"
    ],
    description: "Our Manhattan location features state-of-the-art hyperbaric chambers with premium amenities.",
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
  },
  conyers: {
    name: "Platinum Wellness Spa",
    address: "1990 Parker Rd SE, Conyers, GA 30094",

    email: "billydduc@gmail.com",
    owner: "Billy Duc",
    features: [
      "Ample free parking",
      "Luxury spa amenities",
      "Additional wellness services available",
      "Relaxation area with herbal teas"
    ],
    description: "Our Conyers location offers a serene spa environment with comprehensive wellness services.",
    note: "Ask about our package deals when combining with other spa services.",
    hours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    imageUrl: "/People_HBOT.jpg"
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