import { useMemo } from 'react';

export function useStripePublishableKey(): string {
  return useMemo(() => {
    // Always return Midtown publishable key - this domain serves Midtown only
    return process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY || '';
  }, []);
}