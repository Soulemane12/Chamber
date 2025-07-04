# Email Confirmation Setup for Chamber

This document explains how to set up email confirmations properly for your Chamber application when deployed to Vercel.

## The Issue

When users sign up, they receive an email confirmation link that points to `localhost:3000` instead of your Vercel domain. This happens because Supabase uses the default site URL configured in your project settings.

## Solution

We've implemented several improvements to fix this issue:

1. Added a custom email confirmation handler at `/auth/confirm`
2. Created an API endpoint to update the site URL in Supabase
3. Updated the signup flow to use the correct redirect URL
4. Added a script to manually update the site URL

## How to Fix

### Option 1: Using the API Endpoint (Automatic)

When a user signs up, the application will automatically try to update the site URL by calling the `/api/auth/email-template` endpoint. This should work if your Supabase service role key is properly set up.

### Option 2: Using the Script (Manual)

If the automatic method doesn't work, you can run the included script:

1. Make sure your environment variables are set up:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=your-vercel-domain (e.g., chamber-alpha.vercel.app)
   ```

2. Run the script:
   ```bash
   node scripts/update-site-url.js
   ```

### Option 3: Update Supabase Project Settings (Manual)

1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Update the Site URL to your Vercel domain (e.g., `https://chamber-alpha.vercel.app`)
4. Update the Redirect URLs to include `https://chamber-alpha.vercel.app/auth/confirm`
5. Save the changes

## Environment Variables

Make sure these environment variables are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=your-vercel-domain
```

## Testing

After implementing the fix:

1. Sign up with a new email address
2. Check the confirmation email
3. The link should now point to your Vercel domain instead of localhost
4. Clicking the link should take you to the confirmation page and then redirect to login

## Troubleshooting

If you're still having issues:

1. Check your Supabase service role key permissions
2. Make sure your environment variables are correctly set in Vercel
3. Try updating the site URL manually in the Supabase dashboard
4. Check the browser console and server logs for any errors 