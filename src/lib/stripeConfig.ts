import Stripe from 'stripe';

// Stripe configuration based on location
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export function getStripeConfig(location: string): StripeConfig {
  // Default to Midtown configuration if location not specified or unrecognized
  const normalizedLocation = location?.toLowerCase();

  
  if (normalizedLocation === 'midtown') {
    return {
      secretKey: process.env.MID_STRIPE_SECRET_KEY || '',
      publishableKey: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.MID_STRIPE_WEBHOOK_SECRET || '',
    };
  } else if (normalizedLocation === 'conyers') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    };
  }

  // Fallback to midtown configuration (strict MID_ variables only)
  return {
    secretKey: process.env.MID_STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.MID_STRIPE_WEBHOOK_SECRET || '',
  };
}

export function getStripeInstance(location: string): Stripe {
  const config = getStripeConfig(location);

  if (!config.secretKey) {
    const locationPrefix = location?.toLowerCase() === 'conyers' ? '' : 'MID_';
    console.error(`${locationPrefix}STRIPE_SECRET_KEY is not configured for location: ${location}. Available env vars:`,
      Object.keys(process.env).filter(key => key.includes('STRIPE')));
    throw new Error(`Stripe secret key is not configured for location: ${location}`);
  }

  return new Stripe(config.secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export function getPublishableKey(location: string): string {
  const config = getStripeConfig(location);
  return config.publishableKey;
}