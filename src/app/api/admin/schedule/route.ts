import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  let query = supabase.from('schedule_slots').select('*');
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  // Create or update a slot
  const body = await request.json();
  const { id, date, time, duration, seats_total } = body;
  if (!date || !time || !duration || !seats_total) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  let res;
  if (id) {
    res = await supabase.from('schedule_slots').update({ date, time, duration, seats_total, seats_available: seats_total }).eq('id', id).select();
  } else {
    res = await supabase.from('schedule_slots').insert({ date, time, duration, seats_total, seats_available: seats_total }).select();
  }
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  return NextResponse.json({ data: res.data });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase.from('schedule_slots').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 