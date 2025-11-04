import { NextResponse } from 'next/server';
import { getStripeConfig } from '@/lib/stripeConfig';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'midtown';

  // Get location-specific configuration
  const locationConfig = getStripeConfig(location);

  const config = {
    location,
    locationBased: {
      hasStripeSecret: !!locationConfig.secretKey,
      hasStripePublishable: !!locationConfig.publishableKey,
      hasWebhookSecret: !!locationConfig.webhookSecret,
      stripeSecretLength: locationConfig.secretKey?.length || 0,
      stripeSecretPrefix: locationConfig.secretKey?.substring(0, 10) || 'undefined',
      stripePublishablePrefix: locationConfig.publishableKey?.substring(0, 10) || 'undefined',
      webhookSecretPrefix: locationConfig.webhookSecret?.substring(0, 10) || 'undefined',
    },
    legacy: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined',
      stripePublishablePrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'undefined',
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) || 'undefined',
    },
    midtown: {
      hasStripeSecret: !!process.env.MID_STRIPE_SECRET_KEY,
      hasStripePublishable: !!process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.MID_STRIPE_WEBHOOK_SECRET,
    },
    conyers: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json(config);
}
