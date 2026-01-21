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
 * Get the current branch based on the domain
 */
export function getCurrentBranch(): 'midtown' {
  // Always return midtown for this branch
  return 'midtown';
}

/**
 * Location data for the hyperbaric chamber centers
 */
export const locationData = {
  midtown: {
    name: "Midtown Biohack",
    address: "575 Madison Ave, 23rd floor, New York, NY 10022",
    phone: "",
    email: "contact@midtownbiohack.com",
    owner: "Dr. Chuck Morris",
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
    imageUrl: "/HBOT.png"
  }
};

/**
 * Get location data by location ID
 */
export function getLocationData(locationId: 'midtown' | null) {
  if (!locationId) return null;
  return locationData.midtown;
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
 * Promotion configuration (disabled for Midtown)
 */
export const promotionConfig = {
  isActive: false,
  location: 'midtown',
  startDate: new Date('2025-09-15'),
  endDate: new Date('2025-10-31'),
  pricing: {
    '20': 0,
    '45': 75,
    '60': 90,
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
