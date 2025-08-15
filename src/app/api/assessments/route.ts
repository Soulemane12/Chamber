import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      booking_id,
      assessment_date,
      assessment_time,
      first_name,
      last_name,
      pain_level,
      stress_level,
      focus_level,
      happiness_level,
    } = body;

    // Validate required fields
    if (!assessment_date || !assessment_time || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (
      typeof pain_level !== 'number' || pain_level < 0 || pain_level > 10 ||
      typeof stress_level !== 'number' || stress_level < 0 || stress_level > 10 ||
      typeof focus_level !== 'number' || focus_level < 0 || focus_level > 10 ||
      typeof happiness_level !== 'number' || happiness_level < 0 || happiness_level > 10
    ) {
      return NextResponse.json(
        { error: 'Invalid assessment values. All levels must be between 0 and 10.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        user_id,
        booking_id,
        assessment_date,
        assessment_time,
        first_name,
        last_name,
        pain_level,
        stress_level,
        focus_level,
        happiness_level,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting assessment:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in assessment POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('assessment_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in assessment GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
