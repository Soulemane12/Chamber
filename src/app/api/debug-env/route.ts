import { NextResponse } from 'next/server';

export async function GET() {
  // Create a debug response showing environment variable status without exposing secrets
  const debug = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    midStripeSecret: {
      exists: !!process.env.MID_STRIPE_SECRET_KEY,
      length: process.env.MID_STRIPE_SECRET_KEY?.length || 0,
      prefix: process.env.MID_STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined',
      suffix: process.env.MID_STRIPE_SECRET_KEY?.substring(-4) || 'undefined'
    },
    midStripePublishable: {
      exists: !!process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY,
      length: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY?.length || 0,
      prefix: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'undefined',
      suffix: process.env.NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY?.substring(-4) || 'undefined'
    },
    midStripeWebhook: {
      exists: !!process.env.MID_STRIPE_WEBHOOK_SECRET,
      length: process.env.MID_STRIPE_WEBHOOK_SECRET?.length || 0,
      prefix: process.env.MID_STRIPE_WEBHOOK_SECRET?.substring(0, 10) || 'undefined',
      suffix: process.env.MID_STRIPE_WEBHOOK_SECRET?.substring(-4) || 'undefined'
    },
    allEnvVarsStartingWithMid: Object.keys(process.env).filter(key => key.includes('MID')),
    allEnvVarsStartingWithStripe: Object.keys(process.env).filter(key => key.includes('STRIPE')),
  };

  return NextResponse.json(debug);
}
