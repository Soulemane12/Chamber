import { NextResponse } from 'next/server';
import { getStripeConfig } from '@/lib/stripeConfig';

export async function GET() {
  // Get Midtown configuration (this domain serves Midtown only)
  const midtownConfig = getStripeConfig();

  const config = {
    location: 'midtown',
    midtownConfig: {
      hasStripeSecret: !!midtownConfig.secretKey,
      hasStripePublishable: !!midtownConfig.publishableKey,
      hasWebhookSecret: !!midtownConfig.webhookSecret,
      stripeSecretLength: midtownConfig.secretKey?.length || 0,
      stripeSecretPrefix: midtownConfig.secretKey?.substring(0, 10) || 'undefined',
      stripePublishablePrefix: midtownConfig.publishableKey?.substring(0, 10) || 'undefined',
      webhookSecretPrefix: midtownConfig.webhookSecret?.substring(0, 10) || 'undefined',
    },
    envVarStatus: {
      hasMidStripeSecret: !!process.env.MID_STRIPE_SECRET_KEY,
      hasMidStripePublishable: !!process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY,
      hasMidWebhookSecret: !!process.env.MID_STRIPE_WEBHOOK_SECRET,
    },
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json(config);
}
