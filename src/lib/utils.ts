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
    email: "b.duc@wellnex02.com",
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
    address: "1900 Parker Rd SE, Conyers, GA 30094",
    phone: "+1 (646) 262-8794",
    email: "b.duc@wellnex02.com",
    owner: "Billy Duc",
    features: [
      "Ample free parking",
      "Luxury spa amenities",
      "Additional wellness services available for booking",
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

/**
 * Promotion configuration for Platinum Wellness Spa
 */
export const promotionConfig = {
  isActive: true,
  location: 'conyers', // Platinum Wellness Spa
  startDate: new Date('2025-09-15'),
  endDate: new Date('2025-10-31'),
  pricing: {
    '20': 0,    // FREE 20-Minute HBOT Session
    '45': 75,   // $75 for 45 Minutes
    '60': 90,   // $90 for 60 Minutes
  },
  description: "🌟 Special Promotion: FREE 20-Minute HBOT Session, $75 for 45 Minutes, $90 for 60 Minutes"
};

/**
 * Check if a promotion is active for a given location and date
 */
export function isPromotionActive(location: string, date: Date): boolean {
  if (!promotionConfig.isActive || location !== promotionConfig.location) {
    return false;
  }
  
  const checkDate = new Date(date);
  return checkDate >= promotionConfig.startDate && checkDate <= promotionConfig.endDate;
}

/**
 * Get promotion pricing for a given duration
 */
export function getPromotionPricing(duration: string): number | null {
  if (!promotionConfig.isActive) return null;
  return promotionConfig.pricing[duration as keyof typeof promotionConfig.pricing] ?? null;
} 