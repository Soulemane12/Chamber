# Location-Based Stripe Configuration

This implementation allows the application to use different Stripe accounts based on the selected location (Midtown or Conyers).

## How It Works

1. **Location Detection**: The system uses the `location` parameter from booking requests to determine which Stripe account to use
2. **Environment Variables**: Location-specific environment variables are used to configure different Stripe accounts
3. **Fallback System**: If location-specific variables aren't set, the system falls back to legacy configuration

## Environment Variables Setup

### For Midtown Biohack:
```env
MID_STRIPE_SECRET_KEY=sk_test_your_midtown_stripe_secret_key
NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY=pk_test_your_midtown_stripe_publishable_key
MID_STRIPE_WEBHOOK_SECRET=whsec_your_midtown_webhook_secret
```

### For Conyers Biohack (uses default variable names):
```env
STRIPE_SECRET_KEY=sk_test_your_conyers_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_conyers_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_conyers_webhook_secret
```

## Implementation Details

### Files Modified:
1. `src/lib/stripeConfig.ts` - New utility functions for location-based Stripe configuration
2. `src/hooks/useStripeConfig.ts` - React hook for client-side publishable key selection
3. `src/app/api/stripe/create-payment-intent/route.ts` - Updated to use location-based Stripe instances
4. `src/app/api/stripe/webhook/route.ts` - Updated to handle webhooks from different accounts
5. `src/components/ui/StripePayment.tsx` - Updated to use location-specific publishable keys
6. `src/app/api/test-stripe-config/route.ts` - Updated to show location-based configuration status

### Key Functions:
- `getStripeConfig(location)` - Returns location-specific Stripe configuration
- `getStripeInstance(location)` - Returns configured Stripe instance for a location
- `useStripePublishableKey(location)` - React hook for publishable key selection

## Testing

### Check Configuration Status:
```bash
# Test midtown configuration
curl "http://localhost:3000/api/test-stripe-config?location=midtown"

# Test conyers configuration
curl "http://localhost:3000/api/test-stripe-config?location=conyers"
```

### Expected Response Structure:
```json
{
  "location": "midtown",
  "locationBased": {
    "hasStripeSecret": true,
    "hasStripePublishable": true,
    "hasWebhookSecret": true,
    "stripeSecretLength": 107,
    "stripeSecretPrefix": "sk_test_51",
    "stripePublishablePrefix": "pk_test_51",
    "webhookSecretPrefix": "whsec_1abc"
  },
  "legacy": { /* fallback configuration status */ },
  "midtown": { /* midtown-specific env vars status */ },
  "conyers": { /* conyers-specific env vars status */ }
}
```

## Getting Your Webhook Secret

### For your domain (app.wellnex.com):

1. **Access Stripe Dashboard**:
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Switch to the correct account (Midtown or Conyers)
   - Toggle to **Live mode** for production

2. **Create Webhook Endpoint**:
   - Navigate to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - Set endpoint URL: `https://app.wellnex.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Click **"Add endpoint"**

3. **Get the Secret**:
   - Click on your new webhook
   - In **"Signing secret"** section, click **"Reveal"**
   - Copy the secret (starts with `whsec_`)

### For Each Location:
- **Midtown**: Use the secret as `MID_STRIPE_WEBHOOK_SECRET`
- **Conyers**: Use the secret as `STRIPE_WEBHOOK_SECRET`

## Deployment Notes

1. **Environment Variables**: Set location-specific environment variables in your hosting platform
2. **Webhooks**: Both locations can use the same webhook URL (`https://app.wellnex.com/api/stripe/webhook`)
3. **Testing**: Use the test endpoint to verify configuration before deployment

## Fallback Behavior

- **Midtown**: Uses `MID_*` variables, falls back to default `STRIPE_*` variables
- **Conyers**: Uses default `STRIPE_*` variables directly
- **Default**: Midtown configuration if location is unspecified or unrecognized

## Security Considerations

- Secret keys are never exposed to the client
- Publishable keys are location-specific on the frontend
- Webhook verification tries both location configurations for compatibility