import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'Missing date' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('schedule_slots')
      .select('time, seats_available')
      .eq('date', date);

    if (error) {
      console.error('Error fetching slots:', error);
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    const available = (data || [])
      .filter((s) => s.seats_available && s.seats_available > 0)
      .map((s) => s.time);

    return NextResponse.json({ available });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
} 