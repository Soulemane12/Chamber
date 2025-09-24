import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function POST() {
  try {
    console.log('Starting hip-hop bookings constraint migration...');

    // Since direct SQL execution is complex, let's provide clear instructions
    // and try to test if the table exists first
    const { data: tableCheck, error: tableError } = await supabase
      .from('hip_hop_bookings')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table check error:', tableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not access hip_hop_bookings table',
        details: tableError.message,
        message: 'Please ensure the hip_hop_bookings table exists and run the migration manually.'
      }, { status: 500 });
    }

    // Since we can't easily execute DDL statements through the JS client,
    // we'll provide the exact SQL and instructions
    const migrationSQL = `
-- Drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint that includes 'ifs'
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check 
CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs';
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Migration SQL ready - please run this in your Supabase dashboard',
      migrationSQL: migrationSQL,
      instructions: [
        '1. Go to your Supabase Dashboard (https://app.supabase.com)',
        '2. Select your project',
        '3. Go to SQL Editor',
        '4. Create a new query',
        '5. Copy and paste the migrationSQL above',
        '6. Run the query',
        '7. Test the hip-hop booking form'
      ],
      note: 'The hip_hop_bookings table is accessible, so the migration should work when applied manually.'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Migration preparation failed',
      message: 'Please run the SQL manually in your Supabase dashboard. See /api/admin/fix-hip-hop-constraint for instructions.'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check current constraint status using the correct system table
    const { data: constraintInfo, error } = await supabase
      .from('pg_constraint')
      .select('*')
      .eq('conname', 'hip_hop_bookings_service_check');

    if (error) {
      console.error('Error checking constraint:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not check constraint status',
        details: error.message,
        message: 'Please run the migration manually. See /api/admin/fix-hip-hop-constraint for instructions.'
      }, { status: 500 });
    }

    // If no constraint found, it needs migration
    const needsMigration = constraintInfo.length === 0;
    
    return NextResponse.json({ 
      success: true, 
      constraintInfo: constraintInfo,
      needsMigration: needsMigration,
      message: needsMigration ? 'Migration needed - constraint not found' : 'Constraint exists'
    });

  } catch (error) {
    console.error('Error checking constraint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Could not check constraint status',
      message: 'Please run the migration manually. See /api/admin/fix-hip-hop-constraint for instructions.'
    }, { status: 500 });
  }
}
