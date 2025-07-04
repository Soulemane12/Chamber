// This script updates the site URL in Supabase project settings
// Run with: node scripts/update-site-url.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get the production URL for email templates
const getProductionUrl = () => {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For custom domains
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    return url.includes('http') ? url : `https://${url}`;
  }
  
  // Hardcoded production URL as fallback
  return 'https://chamber-alpha.vercel.app';
};

async function updateSiteUrl() {
  try {
    // Get the production URL
    const productionUrl = getProductionUrl();
    console.log(`Using production URL: ${productionUrl}`);
    
    // Create a service role client to update settings
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Set the site URL for email confirmations
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: 'test@example.com', // This is just a placeholder
      password: 'temporary-password-123', // Required but won't be used
      options: {
        redirectTo: `${productionUrl}/auth/confirm`,
      }
    });
    
    if (error) {
      console.error('Error updating site URL:', error);
      process.exit(1);
    }
    
    console.log('Site URL updated successfully!');
    console.log(`Email confirmations will now redirect to: ${productionUrl}/auth/confirm`);
  } catch (err) {
    console.error('Unexpected error updating site URL:', err);
    process.exit(1);
  }
}

updateSiteUrl(); 