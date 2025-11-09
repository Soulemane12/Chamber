import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';
import { getStripeInstance, getStripeConfig } from '@/lib/stripeConfig';

// Get Stripe instance for Midtown (this domain serves Midtown only)
const getStripeForWebhook = () => {
  return getStripeInstance();
};

const getEndpointSecret = () => {
  const config = getStripeConfig();
  if (!config.webhookSecret) {
    throw new Error('MID_STRIPE_WEBHOOK_SECRET is not configured for Midtown');
  }
  return config.webhookSecret;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature using Midtown configuration only
    const stripe = getStripeForWebhook();
    const endpointSecret = getEndpointSecret();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
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
