"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from './Button';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function PaymentForm({ clientSecret, onPaymentSuccess, onPaymentError, amount, customerInfo }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret]);

  // Effect to hide any Stripe-generated submit buttons
  useEffect(() => {
    const hideStripeButtons = () => {
      // Target buttons within the payment element container specifically
      const paymentContainer = document.querySelector('.payment-element-container');
      if (paymentContainer) {
        const buttons = paymentContainer.querySelectorAll('button');
        buttons.forEach(button => {
          const buttonText = button.textContent || '';
          // Only hide buttons that contain the exact text we want to remove
          if (buttonText.includes('Complete Booking') || 
              buttonText.includes('Book • $') ||
              button.getAttribute('type') === 'submit') {
            (button as HTMLElement).style.display = 'none !important';
          }
        });
      }
      
      // Also target any buttons with the specific classes from the user's example
      const specificButtons = document.querySelectorAll('button.inline-flex.items-center.justify-center.font-medium.transition-colors.duration-200');
      specificButtons.forEach(button => {
        const buttonText = button.textContent || '';
        if (buttonText.includes('Complete Booking') || buttonText.includes('Book • $')) {
          (button as HTMLElement).style.display = 'none !important';
        }
      });
    };

    // Run immediately and set up interval to catch dynamically added buttons
    hideStripeButtons();
    const interval = setInterval(hideStripeButtons, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred");
        onPaymentError(error.message || "An error occurred");
      } else {
        setMessage("An unexpected error occurred.");
        onPaymentError("An unexpected error occurred.");
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage("Payment succeeded!");
      onPaymentSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
    // Disable Stripe's built-in submit button to prevent duplicate buttons
    fields: {
      billingDetails: 'never' as const,
    },
    // Disable the submit button from PaymentElement
    paymentMethodTypes: ['card'],
    // Prevent PaymentElement from generating its own submit button
    wallets: {
      applePay: 'never' as const,
      googlePay: 'never' as const,
    },
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Payment Details
        </h3>
        <p className="text-blue-700 dark:text-blue-300">
          Total Amount: <span className="font-bold">${amount.toFixed(2)}</span>
        </p>
      </div>

      <div className="payment-element-container">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>
      
      <Button
        disabled={isLoading || !stripe || !elements}
        type="button"
        onClick={handleSubmit}
        className="w-full"
      >
        <span id="button-text">
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </span>
      </Button>
      
      {message && (
        <div className={`text-sm ${message.includes('succeeded') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </form>
  );
}

interface StripePaymentProps {
  amount: number;
  duration: string;
  groupSize: string;
  location: string;
  date: Date;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function StripePayment({
  amount,
  duration,
  groupSize,
  location,
  date,
  customerInfo,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        duration,
        groupSize,
        location,
        date: date.toISOString(),
        customerInfo,
      }),
    })
      .then((res) => {
        console.log('Payment intent response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('Payment intent response data:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Payment intent fetch error:', err);
        setError('Failed to initialize payment');
        setIsLoading(false);
      });
  }, [amount, duration, groupSize, location, date, customerInfo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Initializing payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Stripe is not configured. Please contact support.</p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret,
    appearance,
    // Configure to prevent Stripe from generating its own submit button
    loader: 'auto' as const,
    locale: 'auto' as const,
  };

  return (
    <div className="w-full">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm
            clientSecret={clientSecret}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            amount={amount}
            customerInfo={customerInfo}
          />
        </Elements>
      )}
    </div>
  );
}
