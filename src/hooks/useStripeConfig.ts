import { useMemo } from 'react';

export function useStripePublishableKey(location: string): string {
  return useMemo(() => {
    const normalizedLocation = location?.toLowerCase();

    if (normalizedLocation === 'midtown') {
      return process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY ||
             process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    } else if (normalizedLocation === 'conyers') {
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    }

    // Fallback to midtown configuration
    return process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY ||
           process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  }, [location]);
}