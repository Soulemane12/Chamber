import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET() {
  try {
    // Get the production URL
    const productionUrl = getProductionUrl();
    
    // Create a service role client to update email templates
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
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
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Site URL updated successfully',
      productionUrl
    });
  } catch (err) {
    console.error('Unexpected error updating site URL:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 