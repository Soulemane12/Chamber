import { createClient } from '@supabase/supabase-js';

// Get site URL
const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 
  process.env.NEXT_PUBLIC_VERCEL_URL || 
  'http://localhost:3000';

// Define redirectTo outside the createClient options
const redirectTo = `${siteURL}/reset-password?type=recovery`;

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