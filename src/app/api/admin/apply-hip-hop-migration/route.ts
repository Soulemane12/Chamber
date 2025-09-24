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

    // Execute the migration SQL directly
    const migrationSQL = `
      -- Drop the existing constraint
      ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;
      
      -- Add the new constraint that includes 'ifs'
      ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check 
      CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));
      
      -- Update the comment to reflect the new service option
      COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs';
    `;

    // Execute the SQL using rpc or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      
      // If rpc doesn't work, try a different approach
      // Check if the constraint exists and what it currently allows
      const { data: constraintInfo, error: constraintError } = await supabase
        .from('information_schema.check_constraints')
        .select('*')
        .eq('constraint_name', 'hip_hop_bookings_service_check');
        
      if (constraintError) {
        console.error('Error checking constraint:', constraintError);
      } else {
        console.log('Current constraint info:', constraintInfo);
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Migration failed',
        details: error.message,
        message: 'Please run the SQL manually in your Supabase dashboard'
      }, { status: 500 });
    }

    console.log('Migration completed successfully:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Hip-hop bookings constraint migration applied successfully!',
      data: data
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Migration failed',
      message: 'Please run the SQL manually in your Supabase dashboard. See /api/admin/fix-hip-hop-constraint for instructions.'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check current constraint status
    const { data: constraintInfo, error } = await supabase
      .from('information_schema.check_constraints')
      .select('*')
      .eq('constraint_name', 'hip_hop_bookings_service_check');

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not check constraint status',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      constraintInfo: constraintInfo,
      needsMigration: constraintInfo.length === 0 || 
        (constraintInfo[0]?.check_clause && !constraintInfo[0].check_clause.includes("'ifs'"))
    });

  } catch (error) {
    console.error('Error checking constraint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Could not check constraint status'
    }, { status: 500 });
  }
}
