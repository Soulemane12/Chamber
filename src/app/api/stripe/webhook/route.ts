import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';
import { getStripeInstance, getStripeConfig } from '@/lib/stripeConfig';
import { getCreditAllocationRule, calculateExpirationDate } from '@/lib/creditRules';
import { getServiceById } from '@/lib/services';
import { CreditPackage } from '@/types/credits';

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

      // Update booking status and allocate credits if applicable
      try {
        // 1. Get booking details to find service ID
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('*, user_id, booking_reason')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (bookingError || !booking) {
          console.error('Error finding booking:', bookingError);
          break;
        }

        // 2. Update booking payment status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error('Error updating booking payment status:', updateError);
        }

        // 3. Check if this service grants credits
        const serviceId = booking.booking_reason; // Contains service ID
        const creditRule = getCreditAllocationRule(serviceId);

        if (creditRule && booking.user_id) {
          // This is a package purchase - allocate credits
          console.log(`Allocating ${creditRule.sessions} ${creditRule.creditType} credits to user ${booking.user_id}`);

          // 4. Get current user credits
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);

          if (userError || !userData) {
            console.error('Error fetching user:', userError);
            break;
          }

          // 5. Prepare new credit package
          const service = getServiceById(serviceId);
          const expirationDate = calculateExpirationDate(creditRule.expirationDays);
          const purchaseDate = new Date().toISOString();

          const newCreditPackage: CreditPackage = {
            type: creditRule.creditType,
            balance: creditRule.sessions,
            expiresAt: expirationDate,
            packageName: service?.name || serviceId,
            purchasedAt: purchaseDate,
            originalBalance: creditRule.sessions,
          };

          // 6. Add to existing credits (maintain old credits for backwards compatibility)
          const existingCredits = (userData.user.user_metadata?.credits as CreditPackage[]) || [];
          const updatedCredits = [...existingCredits, newCreditPackage];

          // 7. Update user metadata with new credits
          const { error: updateUserError } = await supabase.auth.admin.updateUserById(
            booking.user_id,
            {
              user_metadata: {
                ...userData.user.user_metadata,
                credits: updatedCredits,
              }
            }
          );

          if (updateUserError) {
            console.error('Error updating user credits:', updateUserError);
          } else {
            console.log(`Successfully allocated credits to user ${booking.user_id}`);
          }
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
