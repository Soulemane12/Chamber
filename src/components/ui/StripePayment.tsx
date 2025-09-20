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
      // Target the EXACT button structure from the user's HTML
      const exactButtonSelectors = [
        // The exact button structure
        'button.inline-flex.items-center.justify-center.font-medium.transition-colors.duration-200[type="submit"]',
        'button.bg-blue-600.text-white.hover\\:bg-blue-700[type="submit"]',
        'button.order-1.sm\\:order-2[type="submit"]',
        'button.h-12.rounded-md.px-6.text-lg[type="submit"]',
        // Any button with these class combinations
        'button.inline-flex.items-center.justify-center[type="submit"]',
        'button.bg-blue-600[type="submit"]',
        'button[class*="order-1"][class*="sm:order-2"][type="submit"]',
        // General patterns
        '.payment-element-container button[type="submit"]',
        '.payment-element-container [class*="SubmitButton"]',
        '.payment-element-container [class*="submitButton"]',
        '.__PrivateStripeElement button[type="submit"]',
        '.__PrivateStripeElement [class*="SubmitButton"]',
        '.StripeElement button[type="submit"]',
        'button[class*="bg-blue-600"][type="submit"]',
        'button[class*="order-1"][type="submit"]',
        'button[class*="order-2"][type="submit"]'
      ];

      exactButtonSelectors.forEach(selector => {
        try {
          const buttons = document.querySelectorAll(selector);
          buttons.forEach(button => {
            console.log('Removing exact matching button:', button, 'Selector:', selector);
            button.remove();
          });
        } catch (error) {
          console.debug('Error with selector:', selector, error);
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
                // Remove ANY submit button or Stripe button
                if (element.getAttribute('type') === 'submit') {
                  console.log('Removing newly added unwanted button:', element);
                  element.remove();
                }
              }
              
              // Also check for buttons within the added node
              const nestedButtons = element.querySelectorAll('button[type="submit"], [class*="SubmitButton"], [class*="submitButton"]');
              nestedButtons.forEach(button => {
                // Remove ANY submit button or Stripe button
                if (button.getAttribute('type') === 'submit') {
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
    const interval = setInterval(removeStripeButtons, 300);

    // SUPER AGGRESSIVE: Target buttons with EXACT text content
    const globalRemoval = setInterval(() => {
      const allButtons = document.querySelectorAll('button, [role="button"]');
      allButtons.forEach(button => {
        const text = button.textContent || '';
        const innerHTML = button.innerHTML || '';
        
        // Check for EXACT text patterns from the user's button
        const hasCompleteBooking = text.includes('Complete Booking') || innerHTML.includes('Complete Booking');
        const hasBookDollar = text.includes('Book • $') || innerHTML.includes('Book • $');
        const isSubmitButton = button.getAttribute('type') === 'submit';
        const hasBlueClasses = button.classList.contains('bg-blue-600') && button.classList.contains('text-white');
        const hasOrderClasses = button.classList.contains('order-1') && button.classList.contains('sm:order-2');
        
        if (hasCompleteBooking || hasBookDollar || (isSubmitButton && hasBlueClasses) || hasOrderClasses) {
          // Only remove if it's not our custom payment button
          const isOurButton = button.closest('.space-y-6') && button.textContent?.includes('Pay $');
          if (!isOurButton) {
            console.log('Removing global unwanted button:', button, 'Text:', text, 'Classes:', button.className);
            button.remove();
          }
        }
      });
    }, 100); // Increased frequency to 100ms

    // NUCLEAR OPTION: Search by exact HTML structure
    const nuclearRemoval = setInterval(() => {
      // Look for the exact class combination
      const exactButtons = document.querySelectorAll('button.inline-flex.items-center.justify-center.font-medium.bg-blue-600.text-white');
      exactButtons.forEach(button => {
        if (button.getAttribute('type') === 'submit') {
          console.log('NUCLEAR: Removing button with exact class structure:', button);
          button.remove();
        }
      });
      
      // Also look for any button containing the exact span structure
      const buttonsWithSpans = document.querySelectorAll('button');
      buttonsWithSpans.forEach(button => {
        const spans = button.querySelectorAll('span');
        spans.forEach(span => {
          if (span.textContent?.includes('Complete Booking') || span.textContent?.includes('Book • $')) {
            console.log('NUCLEAR: Removing button containing Complete/Book span:', button);
            button.remove();
          }
        });
      });
    }, 50); // Super fast 50ms interval

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearInterval(globalRemoval);
      clearInterval(nuclearRemoval);
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
    // Completely hide any button elements that Stripe might generate
    rules: {
      '.Tab': {
        display: 'block'
      },
      '.Input': {
        display: 'block'
      },
      // Aggressively hide all possible button variants
      'button': {
        display: 'none !important',
        visibility: 'hidden !important',
        opacity: '0 !important',
        height: '0 !important',
        width: '0 !important',
        overflow: 'hidden !important',
        position: 'absolute !important',
        left: '-9999px !important'
      },
      '[type="submit"]': {
        display: 'none !important'
      },
      '.SubmitButton': {
        display: 'none !important'
      },
      '[class*="SubmitButton"]': {
        display: 'none !important'
      },
      '[class*="submitButton"]': {
        display: 'none !important'
      },
      '[class*="Submit"]': {
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
