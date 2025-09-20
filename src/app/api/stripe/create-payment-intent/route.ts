import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isPromotionActive, getPromotionPricing } from '@/lib/utils';

// Initialize Stripe only when needed
const getStripe = () => {
  // Try to get the secret key from environment or use a fallback
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not configured. Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
};

// Group size multipliers (discount for groups) - same as in BookingForm.tsx
const groupSizeMultipliers = {
  "1": 1.0,    // No discount for single guest
  "2": 1.8,    // 10% discount per guest
  "3": 2.55,   // 15% discount per guest
  "4": 3.2,    // 20% discount per guest
};

export async function POST(request: Request) {
  try {
    console.log('Creating payment intent...');
    console.log('Environment check:', {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined'
    });
    
    const { 
      amount, 
      currency = 'usd', 
      duration, 
      groupSize, 
      location, 
      date,
      customerInfo 
    } = await request.json();

    console.log('Payment intent data:', { amount, duration, groupSize, location, date });

    // Validate required fields
    if (!amount || !duration || !groupSize || !location || !date) {
      console.error('Missing required fields:', { amount, duration, groupSize, location, date });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate price based on duration and promotions
    const prices: Record<string, number> = {
      '20': 1,     // $1 test option
      '60': 150,
      '90': 200,
      '120': 250
    };

    // Check if promotion is active
    const isPromoActive = isPromotionActive(location, new Date(date));
    let calculatedAmount: number;

    if (isPromoActive) {
      // Use promotion pricing - no group discounts during promotion
      const promoPrice = getPromotionPricing(duration);
      calculatedAmount = promoPrice !== null ? promoPrice : (prices[duration] || 150);
    } else {
      // Regular pricing with group discounts
      const basePrice = prices[duration] || 150;
      const multiplier = groupSizeMultipliers[groupSize as keyof typeof groupSizeMultipliers] || 1.0;
      calculatedAmount = basePrice * multiplier;
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(calculatedAmount * 100);
    console.log('Calculated amount:', calculatedAmount, 'Amount in cents:', amountInCents);

    // Validate amount
    if (amountInCents < 50) { // Minimum $0.50
      console.error('Amount too low:', amountInCents);
      return NextResponse.json(
        { error: 'Payment amount is too low. Minimum is $0.50.' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    console.log('Initializing Stripe...');
    let stripe;
    try {
      stripe = getStripe();
      console.log('Stripe initialized successfully');
    } catch (stripeError) {
      console.error('Stripe initialization failed:', stripeError);
      return NextResponse.json(
        { error: 'Stripe is not configured properly' },
        { status: 503 }
      );
    }
    
    console.log('Creating payment intent...');
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          duration,
          groupSize,
          location,
          date,
          customerEmail: customerInfo?.email || '',
          customerName: `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim(),
          isPromotionActive: isPromoActive.toString(),
        },
      });
      console.log('Payment intent created successfully:', paymentIntent.id);
    } catch (stripeError) {
      console.error('Stripe payment intent creation failed:', stripeError);
      return NextResponse.json(
        { error: 'Failed to create payment intent with Stripe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: calculatedAmount,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment intent';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('STRIPE_SECRET_KEY is not configured')) {
        errorMessage = 'Stripe is not configured. Please contact support.';
        statusCode = 503;
      } else if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Invalid Stripe configuration. Please contact support.';
        statusCode = 503;
      } else if (error.message.includes('amount')) {
        errorMessage = 'Invalid payment amount. Please try again.';
        statusCode = 400;
      } else {
        errorMessage = `Payment error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
