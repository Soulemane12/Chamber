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

  // Effect to immediately remove any Stripe-generated buttons from DOM
  useEffect(() => {
    const removeStripeButtons = () => {
      // Remove any buttons that Stripe might generate
      const buttonsToRemove = document.querySelectorAll([
        '.payment-element-container button[type="submit"]',
        '.payment-element-container [class*="SubmitButton"]',
        '.payment-element-container [class*="submitButton"]',
        '.__PrivateStripeElement button[type="submit"]',
        '.__PrivateStripeElement [class*="SubmitButton"]',
        '.StripeElement button[type="submit"]',
        'button[class*="bg-blue-600"][type="submit"]',
        'button[class*="order-1"][type="submit"]',
        'button[class*="order-2"][type="submit"]'
      ].join(', '));

      buttonsToRemove.forEach(button => {
        const buttonText = button.textContent || '';
        if (buttonText.includes('Complete Booking') || 
            buttonText.includes('Book • $') ||
            button.getAttribute('type') === 'submit') {
          console.log('Removing unwanted button:', button);
          button.remove(); // Actually remove from DOM instead of hiding
        }
      });
    };

    // Set up MutationObserver to remove buttons as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check if the added node is a button we want to remove
              if (element.matches && (
                element.matches('button[type="submit"]') ||
                element.matches('[class*="SubmitButton"]') ||
                element.matches('[class*="submitButton"]')
              )) {
                const buttonText = element.textContent || '';
                if (buttonText.includes('Complete Booking') || 
                    buttonText.includes('Book • $') ||
                    element.getAttribute('type') === 'submit') {
                  console.log('Removing newly added unwanted button:', element);
                  element.remove();
                }
              }
              
              // Also check for buttons within the added node
              const nestedButtons = element.querySelectorAll('button[type="submit"], [class*="SubmitButton"], [class*="submitButton"]');
              nestedButtons.forEach(button => {
                const buttonText = button.textContent || '';
                if (buttonText.includes('Complete Booking') || 
                    buttonText.includes('Book • $') ||
                    button.getAttribute('type') === 'submit') {
                  console.log('Removing nested unwanted button:', button);
                  button.remove();
                }
              });
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Run immediately and periodically
    removeStripeButtons();
    const interval = setInterval(removeStripeButtons, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
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
    layout: "accordion" as const, // Changed from tabs to accordion
    // Completely disable billing details collection
    fields: {
      billingDetails: 'never' as const,
    },
    // Only allow card payments
    paymentMethodTypes: ['card'],
    // Disable all wallet options
    wallets: {
      applePay: 'never' as const,
      googlePay: 'never' as const,
    },
    // Provide default values to minimize form fields
    defaultValues: {
      billingDetails: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
      }
    },
    // Disable automatic submission
    readOnly: false,
    // Terms configuration to prevent additional elements
    terms: {
      card: 'never' as const,
    }
  };

  return (
    <div id="payment-form" className="space-y-6">
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
    </div>
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
    // Hide any submit buttons that Stripe might generate
    rules: {
      '.Tab': {
        display: 'block'
      },
      '.Input': {
        display: 'block'
      },
      // Hide any button elements within the payment element
      'button[type="submit"]': {
        display: 'none !important'
      },
      '.SubmitButton': {
        display: 'none !important'
      },
      '[class*="SubmitButton"]': {
        display: 'none !important'
      }
    }
  };

  const options = {
    clientSecret,
    appearance,
    // Configure to prevent Stripe from generating its own submit button
    loader: 'auto' as const,
    locale: 'auto' as const,
    // Additional options to suppress functionality
    fonts: []
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
