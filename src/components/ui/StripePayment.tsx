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

  // Effect to hide any Stripe-generated submit buttons using MutationObserver
  useEffect(() => {
    const hideStripeButtons = (targetNode?: Element | Document) => {
      // Define all possible selectors for buttons we want to hide
      const selectors = [
        'button[type="submit"]',
        'button[class*="SubmitButton"]',
        'button[class*="submitButton"]',
        'button[class*="Submit"]',
        'button[class*="bg-blue-600"]',
        'button[class*="bg-blue-700"]',
        'button[class*="order-1"]',
        'button[class*="order-2"]',
        'button[class*="sm:order-2"]',
        'button.inline-flex.items-center.justify-center',
        '[data-testid*="submit"]',
        '[data-testid*="Submit"]',
        '[class*="SubmitButton"]',
        '[class*="submitButton"]'
      ];

      // Target the specific container or the entire document
      const searchRoot = targetNode || document;
      
      selectors.forEach(selector => {
        try {
          const elements = searchRoot.querySelectorAll(selector);
          elements.forEach(element => {
            const buttonText = element.textContent || '';
            const isSubmitButton = element.getAttribute('type') === 'submit';
            const hasProblematicText = buttonText.includes('Complete Booking') || 
                                      buttonText.includes('Book • $') ||
                                      buttonText.includes('Submit payment') ||
                                      buttonText.includes('Pay now');
            
            // Hide if it's a submit button or has problematic text
            if (isSubmitButton || hasProblematicText) {
              const htmlElement = element as HTMLElement;
              htmlElement.style.display = 'none';
              htmlElement.style.visibility = 'hidden';
              htmlElement.style.opacity = '0';
              htmlElement.style.pointerEvents = 'none';
              htmlElement.style.position = 'absolute';
              htmlElement.style.left = '-9999px';
              htmlElement.style.height = '0';
              htmlElement.style.width = '0';
              htmlElement.style.overflow = 'hidden';
              
              // Also remove from tab order
              htmlElement.setAttribute('tabindex', '-1');
              htmlElement.setAttribute('aria-hidden', 'true');
            }
          });
        } catch (error) {
          console.debug('Error hiding button with selector:', selector, error);
        }
      });
    };

    // Run immediately
    hideStripeButtons();

    // Set up MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Hide buttons in the newly added node
              hideStripeButtons(element);
              // Also check if the node itself is a button we want to hide
              if (element.matches && (
                element.matches('button[type="submit"]') ||
                element.matches('[class*="SubmitButton"]') ||
                element.matches('[class*="submitButton"]')
              )) {
                hideStripeButtons(document);
              }
            }
          });
        }
        
        // Also check for attribute changes that might reveal hidden buttons
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.matches && (
            target.matches('button[type="submit"]') ||
            target.matches('[class*="SubmitButton"]') ||
            target.matches('[class*="submitButton"]')
          )) {
            hideStripeButtons();
          }
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'type', 'data-testid']
    });

    // Also run periodically as a fallback (less frequent than before)
    const fallbackInterval = setInterval(hideStripeButtons, 1000);

    return () => {
      observer.disconnect();
      clearInterval(fallbackInterval);
    };
  }, []);

  // Additional effect to prevent any form submission events
  useEffect(() => {
    const preventFormSubmission = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Check if the event is coming from a submit button we want to block
      if (target && (
        target.matches('button[type="submit"]') ||
        target.matches('[class*="SubmitButton"]') ||
        target.matches('[class*="submitButton"]') ||
        (target.textContent && (
          target.textContent.includes('Complete Booking') ||
          target.textContent.includes('Book • $')
        ))
      )) {
        console.debug('Preventing unwanted form submission from:', target);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Add event listeners to catch form submissions
    document.addEventListener('submit', preventFormSubmission, true);
    document.addEventListener('click', preventFormSubmission, true);
    
    return () => {
      document.removeEventListener('submit', preventFormSubmission, true);
      document.removeEventListener('click', preventFormSubmission, true);
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
    // Additional options to suppress button generation
    defaultValues: {
      billingDetails: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
      }
    },
    // Prevent any form submission behavior
    business: {
      name: 'Chamber Booking'
    }
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
