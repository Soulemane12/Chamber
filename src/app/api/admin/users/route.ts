import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Debug logs for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('API Route - Supabase URL exists:', !!supabaseUrl);
console.log('API Route - Service Role Key exists:', !!serviceRoleKey);

const supabase = createClient(
  supabaseUrl as string,
  serviceRoleKey as string,
);

export async function GET() {
  try {
    console.log('API Route - Fetching profiles');
    
    // First, try to select only the columns that definitely exist
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, address, phone, dob, avatar_url');

    if (error) {
      console.error('API Route - Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }
    
    // Now try to get demographic columns if they exist
    try {
      const { data: demographicData, error: demographicError } = await supabase
        .from('profiles')
        .select('id, gender, race, education, profession')
        .limit(1);
        
      if (!demographicError && demographicData) {
        // Demographic columns exist, fetch all data with these columns
        const { data: fullData, error: fullError } = await supabase
          .from('profiles')
          .select('id, full_name, address, phone, dob, avatar_url, gender, race, education, profession');
          
        if (!fullError) {
          console.log('API Route - Profiles with demographics fetched successfully:', fullData?.length);
          // Map full_name to name for compatibility with the component
          const mappedData = fullData?.map(profile => ({
            ...profile,
            name: profile.full_name
          }));
          return NextResponse.json(mappedData);
        }
      }
    } catch {
      // Ignore errors here, we'll just return the basic data
      console.log('API Route - Demographic columns might not exist yet');
    }
    
    console.log('API Route - Basic profiles fetched successfully:', data?.length);
    // Map full_name to name for compatibility with the component
    const mappedData = data?.map(profile => ({
      ...profile,
      name: profile.full_name
    }));
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('API Route - Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching profiles'
    }, { status: 500 });
  }
} 