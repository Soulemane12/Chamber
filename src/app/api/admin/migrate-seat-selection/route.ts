import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// This endpoint adds the seat_data column to the bookings table
export async function GET() {
  try {
    // Check if the admin API key is provided
    const adminKey = process.env.SUPABASE_ADMIN_KEY;
    
    if (!adminKey) {
      return NextResponse.json(
        { error: 'Admin key not found in environment variables' },
        { status: 500 }
      );
    }

    // Connect to Supabase with admin privileges
    const supabaseAdmin = supabase;

    // Check if the column already exists
    const { data: columnExists, error: columnCheckError } = await supabaseAdmin.rpc(
      'column_exists',
      { table_name: 'bookings', column_name: 'seat_data' }
    );

    if (columnCheckError) {
      console.error('Error checking column existence:', columnCheckError);
      
      // If the RPC function doesn't exist, check the table schema directly
      const { data: tableInfo, error: tableInfoError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .limit(1);
        
      if (tableInfoError) {
        console.error('Error fetching table schema:', tableInfoError);
        return NextResponse.json({ error: tableInfoError.message }, { status: 500 });
      }
      
      // If we got data, check if the column exists in the first row
      if (tableInfo && tableInfo[0] && 'seat_data' in tableInfo[0]) {
        return NextResponse.json(
          { message: 'seat_data column already exists' },
          { status: 200 }
        );
      }
    } else if (columnExists) {
      return NextResponse.json(
        { message: 'seat_data column already exists' },
        { status: 200 }
      );
    }

    // Add the seat_data column to store seat selection information as JSON
    const { error: alterTableError } = await supabaseAdmin.rpc(
      'alter_table_add_column',
      {
        table_name: 'bookings',
        column_name: 'seat_data',
        column_type: 'jsonb',
        column_default: 'null'
      }
    );

    if (alterTableError) {
      console.error('Error adding seat_data column using RPC:', alterTableError);
      
      // Try direct SQL as fallback (requires admin privileges)
      const { error: sqlError } = await supabaseAdmin.rpc(
        'execute_sql',
        {
          sql: 'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_data JSONB DEFAULT NULL'
        }
      );
      
      if (sqlError) {
        console.error('Error adding seat_data column using SQL:', sqlError);
        return NextResponse.json(
          { error: 'Failed to add seat_data column', details: sqlError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Migration completed successfully',
        updates: [
          'Added seat_data column to bookings table'
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error during migration:', error);
    return NextResponse.json(
      { error: 'Unexpected error during migration', details: String(error) },
      { status: 500 }
    );
  }
} 