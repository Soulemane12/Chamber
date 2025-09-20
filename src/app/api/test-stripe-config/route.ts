import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripeSecretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
    stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined',
    stripePublishablePrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'undefined',
    webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) || 'undefined',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json(config);
}
