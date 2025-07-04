import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from './utils';

// Create a custom Supabase client with redirect settings
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      fetch: fetch.bind(globalThis)
    },
  }
);

// Set up email confirmation redirect
export const setupEmailRedirect = async () => {
  try {
    const siteUrl = getSiteUrl();
    console.log("Setting up email redirect to:", siteUrl + "login");
    
    // Update auth settings to use the correct redirect URL
    await supabase.auth.setSession({
      access_token: '',
      refresh_token: '',
    });
  } catch (error) {
    console.error("Error setting up email redirect:", error);
  }
}; 