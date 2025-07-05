import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

console.log("API Route - Supabase URL exists:", !!supabaseUrl);
console.log("API Route - Service Role Key exists:", !!supabaseServiceRoleKey);

// Create a Supabase client with the service role key
const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    // Fetch all profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in admin/users GET route:", err);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

// Add PATCH method for updating user data
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...profileData } = body;
    
    // Validate required data
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Profile updated successfully", profile: data[0] });
  } catch (err) {
    console.error("Error in admin/users PATCH route:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
} 