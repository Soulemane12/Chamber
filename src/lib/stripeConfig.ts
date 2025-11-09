import Stripe from 'stripe';

// Midtown-only Stripe configuration
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export function getStripeConfig(): StripeConfig {
  // Always return Midtown configuration - this domain serves Midtown only
  return {
    secretKey: process.env.MID_STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.MID_STRIPE_WEBHOOK_SECRET || '',
  };
}

export function getStripeInstance(): Stripe {
  const config = getStripeConfig();

  if (!config.secretKey) {
    console.error('MID_STRIPE_SECRET_KEY is not configured. Available env vars:',
      Object.keys(process.env).filter(key => key.includes('STRIPE')));
    throw new Error('Stripe secret key is not configured for Midtown');
  }

  return new Stripe(config.secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export function getPublishableKey(): string {
  const config = getStripeConfig();
  return config.publishableKey;
}