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
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('cleaning_schedules')
      .select(`
        *,
        chambers (
          id,
          name,
          description,
          status,
          location,
          capacity
        )
      `);
    
    if (chamberId) {
      query = query.eq('chamber_id', chamberId);
    }
    
    if (date) {
      query = query.eq('cleaning_date', date);
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
    console.error('Error fetching cleaning schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chamber_id, cleaning_date, cleaning_time, duration, status } = body;
    
    if (!chamber_id || !cleaning_date || !cleaning_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if cleaning is already scheduled for this time slot
    const { data: existingCleaning, error: checkError } = await supabase
      .from('cleaning_schedules')
      .select('id')
      .eq('chamber_id', chamber_id)
      .eq('cleaning_date', cleaning_date)
      .eq('cleaning_time', cleaning_time)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existingCleaning) {
      return NextResponse.json({ error: 'Cleaning is already scheduled for this time slot' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('cleaning_schedules')
      .insert({
        chamber_id,
        cleaning_date,
        cleaning_time,
        duration: duration || 30,
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
        )
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating cleaning schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, chamber_id, cleaning_date, cleaning_time, duration, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing cleaning schedule ID' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (chamber_id !== undefined) updateData.chamber_id = chamber_id;
    if (cleaning_date !== undefined) updateData.cleaning_date = cleaning_date;
    if (cleaning_time !== undefined) updateData.cleaning_time = cleaning_time;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    
    const { data, error } = await supabase
      .from('cleaning_schedules')
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
        )
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating cleaning schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing cleaning schedule ID' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('cleaning_schedules')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cleaning schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 