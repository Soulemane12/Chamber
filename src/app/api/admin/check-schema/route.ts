import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    // Try to insert a test profile with all the fields
    const testData = {
      id: '00000000-0000-0000-0000-000000000000', // This ID won't be used
      name: 'Test User',
      email: 'test@example.com',
      address: '123 Test St',
      phone: '555-1234',
      dob: '2000-01-01',
      gender: 'test',
      race: 'test',
      education: 'test',
      profession: 'test'
    };
    
    // Try to insert (will fail with duplicate key, but that's fine)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(testData)
      .select();
      
    // Check what fields are actually in the table
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    let availableColumns = [];
    if (!tableError && tableInfo && tableInfo.length > 0) {
      availableColumns = Object.keys(tableInfo[0]);
    }
    
    // Check if we can query with the demographic columns
    const { error: demoError } = await supabase
      .from('profiles')
      .select('gender, race, education, profession')
      .limit(1);
      
    return NextResponse.json({
      insert_error: insertError ? {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      } : null,
      table_error: tableError ? tableError.message : null,
      available_columns: availableColumns,
      demographic_columns_error: demoError ? demoError.message : null,
      demographic_columns_available: !demoError
    });
  } catch (err) {
    console.error('Error checking schema:', err);
    return NextResponse.json({ 
      error: 'Error checking schema',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
} 