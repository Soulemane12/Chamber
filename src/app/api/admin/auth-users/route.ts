import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl as string,
  serviceRoleKey as string,
);

// GET - List all auth users
export async function GET() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return simplified user data
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Unexpected error listing users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
