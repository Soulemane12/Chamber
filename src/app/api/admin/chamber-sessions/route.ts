import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chamberId = searchParams.get('chamber_id');
    const bookingId = searchParams.get('booking_id');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('chamber_sessions')
      .select(`
        *,
        chambers (
          id,
          name,
          description,
          status,
          location,
          capacity
        ),
        bookings (
          id,
          first_name,
          last_name,
          email,
          phone,
          group_size,
          amount,
          status
        )
      `);
    
    if (chamberId) {
      query = query.eq('chamber_id', chamberId);
    }
    
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    
    if (date) {
      query = query.eq('session_date', date);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching chamber sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chamber_id, booking_id, session_date, session_time, duration, status } = body;
    
    if (!chamber_id || !booking_id || !session_date || !session_time || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if chamber is available for this time slot
    const { data: existingSession, error: checkError } = await supabase
      .from('chamber_sessions')
      .select('id')
      .eq('chamber_id', chamber_id)
      .eq('session_date', session_date)
      .eq('session_time', session_time)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existingSession) {
      return NextResponse.json({ error: 'Chamber is already booked for this time slot' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('chamber_sessions')
      .insert({
        chamber_id,
        booking_id,
        session_date,
        session_time,
        duration,
        status: status || 'scheduled'
      })
      .select(`
        *,
        chambers (
          id,
          name,
          description,
          status,
          location,
          capacity
        ),
        bookings (
          id,
          first_name,
          last_name,
          email,
          phone,
          group_size,
          amount,
          status
        )
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating chamber session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, chamber_id, booking_id, session_date, session_time, duration, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (chamber_id !== undefined) updateData.chamber_id = chamber_id;
    if (booking_id !== undefined) updateData.booking_id = booking_id;
    if (session_date !== undefined) updateData.session_date = session_date;
    if (session_time !== undefined) updateData.session_time = session_time;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('chamber_sessions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        chambers (
          id,
          name,
          description,
          status,
          location,
          capacity
        ),
        bookings (
          id,
          first_name,
          last_name,
          email,
          phone,
          group_size,
          amount,
          status
        )
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating chamber session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('chamber_sessions')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chamber session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 