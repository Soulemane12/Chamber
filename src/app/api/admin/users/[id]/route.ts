import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Define an interface for the route params
interface RouteParams {
  id: string;
}

// Define the route handlers with proper context typing
export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, address, phone, dob, avatar_url, gender, race, education, profession')
      .eq('id', id)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Map full_name to name for component compatibility
    const userData = {
      ...data,
      name: data.full_name
    };
    
    return NextResponse.json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Validate required fields
    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Extract the fields we want to update
    const {
      full_name,
      address,
      phone,
      dob,
      gender,
      race,
      education,
      profession
    } = body;
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        address,
        phone,
        dob,
        gender,
        race,
        education,
        profession
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Map full_name to name for component compatibility
    const userData = data?.[0] ? {
      ...data[0],
      name: data[0].full_name
    } : null;
    
    return NextResponse.json(userData);
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 