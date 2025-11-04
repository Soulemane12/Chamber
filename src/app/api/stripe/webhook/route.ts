import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';
import { getStripeInstance, getStripeConfig } from '@/lib/stripeConfig';

// Get Stripe instance based on location from payment intent metadata
const getStripeForWebhook = (location?: string) => {
  // If no location provided, try default configuration (midtown)
  const locationToUse = location || 'midtown';
  return getStripeInstance(locationToUse);
};

const getEndpointSecret = (location?: string) => {
  const config = getStripeConfig(location || 'midtown');
  if (!config.webhookSecret) {
    throw new Error(`STRIPE_WEBHOOK_SECRET is not configured for location: ${location || 'default'}`);
  }
  return config.webhookSecret;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // For webhook verification, we need to try all possible webhook secrets
    // since we don't know the location beforehand
    let stripe: Stripe;
    let endpointSecret: string;
    let verificationError: Error | null = null;

    // Try midtown configuration first (default)
    try {
      stripe = getStripeForWebhook('midtown');
      endpointSecret = getEndpointSecret('midtown');
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (midtownError) {
      verificationError = midtownError as Error;

      // Try conyers configuration
      try {
        stripe = getStripeForWebhook('conyers');
        endpointSecret = getEndpointSecret('conyers');
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        verificationError = null; // Reset error if successful
      } catch {
        // If both fail, throw the original error
        throw verificationError;
      }
    }

    if (verificationError) {
      throw verificationError;
    }
  } catch (err) {
    console.error('Webhook signature verification failed for all locations:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      
      // Update booking status in database
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ 
            payment_status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating booking payment status:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Update booking status to failed
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ 
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', failedPayment.id);

        if (error) {
          console.error('Error updating failed payment status:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
