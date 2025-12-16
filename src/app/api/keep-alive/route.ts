import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// This endpoint is called by Vercel cron to keep Supabase active
// Supabase free tier pauses after 7 days of inactivity

export async function GET() {
  try {
    // Simple query to keep the database active
    const { data, error } = await supabase
      .from('hip_hop_bookings')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive ping failed:', error.message);
      return NextResponse.json(
        { success: false, error: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    console.log('Keep-alive ping successful at', new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
