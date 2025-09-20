import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isPromotionActive, getPromotionPricing } from '@/lib/utils';

// Initialize Stripe only when needed
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
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

    // Create a PaymentIntent with the order amount and currency
    console.log('Initializing Stripe...');
    const stripe = getStripe();
    console.log('Stripe initialized, creating payment intent...');
    
    const paymentIntent = await stripe.paymentIntents.create({
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
