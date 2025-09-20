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

  // GLOBAL DOCUMENT-WIDE button removal - runs at app level
  useEffect(() => {
    // SAFE function that ONLY targets the specific unwanted button
    const safeButtonDestroyer = () => {
      // ONLY scan for buttons with the EXACT unwanted text - be very specific
      const allButtons = document.querySelectorAll('button, [type="submit"], [role="button"]');
      
      allButtons.forEach((button) => {
        const element = button as HTMLElement;
        const text = element.textContent || '';
        const innerHTML = element.innerHTML || '';
        
        // VERY SPECIFIC targeting - only remove if it has the exact unwanted text
        const hasExactCompleteBooking = text.includes('Complete Booking') && text.includes('$');
        const hasExactBookDollar = text.includes('Book • $') && !text.includes('Pay $');
        
        // Check spans for the exact unwanted text
        const spans = element.querySelectorAll('span');
        let hasUnwantedSpan = false;
        spans.forEach(span => {
          const spanText = span.textContent || '';
          if ((spanText.includes('Complete Booking') && spanText.includes('$')) || 
              (spanText.includes('Book • $') && !spanText.includes('Pay'))) {
            hasUnwantedSpan = true;
          }
        });
        
        // ONLY remove if it matches the exact unwanted button pattern
        if (hasExactCompleteBooking || hasExactBookDollar || hasUnwantedSpan) {
          // Double-check it's NOT our legitimate payment button
          const isLegitimatePayButton = text.includes('Pay $') || 
                                      element.id === 'button-text' ||
                                      element.id === 'legitimate-pay-button' ||
                                      element.closest('#legitimate-pay-button') ||
                                      element.closest('[id*="payment-form"]') ||
                                      text.includes('Processing...');
          
          if (!isLegitimatePayButton) {
            console.log('🎯 SAFE DESTROYER: Removing unwanted button:', element, 'Text:', text);
            element.remove();
          } else {
            console.log('✅ PROTECTED: Keeping legitimate payment button:', element, 'Text:', text);
          }
        }
      });
    };

    // Run immediately when component mounts
    safeButtonDestroyer();
    
    // Use MUCH less aggressive scanning to avoid interfering with payment flow
    const safeInterval = setInterval(safeButtonDestroyer, 1000); // Only every 1 second

    // Set up MutationObserver for the ENTIRE document
    const globalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Run destroyer whenever ANY element is added to the DOM
              setTimeout(safeButtonDestroyer, 0);
            }
          });
        }
      });
    });

    // Observe the entire document body
    globalObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // SAFE click handler - only prevent clicks on exact unwanted buttons
    const safeClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.tagName === 'BUTTON') {
        const text = target.textContent || '';
        // ONLY prevent clicks on buttons with exact unwanted text
        const isUnwantedButton = (text.includes('Complete Booking') && text.includes('$')) ||
                               (text.includes('Book • $') && !text.includes('Pay $'));
        
        // Make sure it's NOT our legitimate payment button
        const isLegitimateButton = text.includes('Pay $') || 
                                 text.includes('Processing...') ||
                                 target.id === 'legitimate-pay-button' ||
                                 target.closest('#legitimate-pay-button') ||
                                 target.closest('[id*="payment-form"]');
        
        if (isUnwantedButton && !isLegitimateButton) {
          console.log('🎯 CLICK PREVENTED: Blocking unwanted button click', target);
          event.preventDefault();
          event.stopPropagation();
          target.remove();
        } else if (isLegitimateButton) {
          console.log('✅ CLICK ALLOWED: Legitimate payment button clicked', target);
        }
      }
    };

    // Only add click listener if needed - less aggressive
    document.addEventListener('click', safeClickHandler, true);

    // Also scan for iframes that might contain the button
    const scanIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          // Try to access iframe content (might fail due to cross-origin)
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const iframeButtons = iframeDoc.querySelectorAll('button, [type="submit"]');
            iframeButtons.forEach(button => {
              const text = button.textContent || '';
              if (text.includes('Complete') || text.includes('Book •')) {
                console.log('🔥 IFRAME: Removing button from iframe:', button);
                button.remove();
              }
            });
          }
        } catch (error) {
          // Iframe is cross-origin, can't access
          console.debug('Cannot access iframe content (cross-origin):', iframe);
        }
      });
    };

    const iframeInterval = setInterval(scanIframes, 1000);

    return () => {
      clearInterval(safeInterval);
      clearInterval(iframeInterval);
      globalObserver.disconnect();
      document.removeEventListener('click', safeClickHandler, true);
    };
  }, []);

  // Simplified CSS-based removal for Stripe elements that don't need JS
  useEffect(() => {
    // Just add a simple CSS-based removal for common Stripe buttons
    const style = document.createElement('style');
    style.textContent = `
      .payment-element-container button[type="submit"]:not([id*="button-text"]) {
        display: none !important;
      }
      .__PrivateStripeElement button[type="submit"] {
        display: none !important;
      }
      .StripeElement button[type="submit"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log('💳 PAYMENT FLOW: Pay button clicked, starting payment process');
    
    if (e) {
      e.preventDefault();
    }

    if (!stripe || !elements) {
      console.error('❌ PAYMENT FLOW: Stripe or elements not loaded');
      return;
    }

    console.log('💳 PAYMENT FLOW: Setting loading state and confirming payment');
    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      console.log('💳 PAYMENT FLOW: Payment confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('❌ PAYMENT FLOW: Payment failed with error:', error);
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "An error occurred");
          onPaymentError(error.message || "An error occurred");
        } else {
          setMessage("An unexpected error occurred.");
          onPaymentError("An unexpected error occurred.");
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ PAYMENT FLOW: Payment succeeded, calling onPaymentSuccess');
        setMessage("Payment succeeded!");
        onPaymentSuccess(paymentIntent.id);
      } else {
        console.warn('⚠️ PAYMENT FLOW: Unexpected payment state:', paymentIntent?.status);
      }
    } catch (error) {
      console.error('❌ PAYMENT FLOW: Exception during payment processing:', error);
      setMessage("An unexpected error occurred.");
      onPaymentError("Payment processing failed");
    }

    setIsLoading(false);
    console.log('💳 PAYMENT FLOW: Payment process completed');
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
        onClick={(e) => {
          console.log('🔘 BUTTON CLICK: Our legitimate Pay button was clicked');
          handleSubmit(e);
        }}
        className="w-full"
        id="legitimate-pay-button"
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
