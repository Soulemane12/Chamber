import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const service = url.searchParams.get('service') || '';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Build the query
    let query = supabase
      .from('hip_hop_bookings')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('preferred_date', startDate);
    }

    if (endDate) {
      query = query.lte('preferred_date', endDate);
    }

    if (service) {
      query = query.eq('service', service);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      // If table doesn't exist, try to get data from regular bookings table with hip hop filter
      if (error.message?.includes('relation "hip_hop_bookings" does not exist')) {
        console.log('hip_hop_bookings table does not exist, checking regular bookings table');
        
        let fallbackQuery = supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .like('notes', '%HIP HOP NOMINEE%');

        // Apply the same filters to fallback query
        if (search) {
          fallbackQuery = fallbackQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (startDate) {
          fallbackQuery = fallbackQuery.gte('date', startDate);
        }

        if (endDate) {
          fallbackQuery = fallbackQuery.lte('date', endDate);
        }

        // Apply sorting and pagination
        fallbackQuery = fallbackQuery.order(sortBy === 'preferred_date' ? 'date' : sortBy, { ascending: sortOrder === 'asc' });
        fallbackQuery = fallbackQuery.range(from, to);

        const { data: fallbackData, error: fallbackError, count: fallbackCount } = await fallbackQuery;

        if (fallbackError) {
          console.error('Error fetching fallback hip hop bookings:', fallbackError);
          return NextResponse.json(
            { success: false, error: fallbackError.message },
            { status: 500 }
          );
        }

        // Transform fallback data to match hip hop booking format
        const transformedData = fallbackData?.map(booking => ({
          id: booking.id,
          first_name: booking.first_name,
          last_name: booking.last_name,
          email: booking.email,
          phone: booking.phone,
          service: 'hbot', // Default since we can't extract from notes easily
          preferred_date: booking.date,
          preferred_time: booking.time,
          notes: booking.notes,
          created_at: booking.created_at,
          updated_at: booking.updated_at || booking.created_at,
          // Mark as fallback data
          _source: 'fallback'
        })) || [];

        return NextResponse.json({
          success: true,
          data: transformedData,
          pagination: {
            page,
            pageSize,
            total: fallbackCount || 0,
            totalPages: Math.ceil((fallbackCount || 0) / pageSize)
          },
          _note: 'Data retrieved from regular bookings table (hip_hop_bookings table not found)'
        });
      }

      console.error('Error fetching hip hop bookings:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get summary statistics
export async function POST(request: Request) {
  try {
    const { data, error } = await supabase
      .from('hip_hop_bookings')
      .select('service, created_at, preferred_date');

    if (error) {
      // Fallback to regular bookings table
      if (error.message?.includes('relation "hip_hop_bookings" does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bookings')
          .select('notes, created_at, date')
          .like('notes', '%HIP HOP NOMINEE%');

        if (fallbackError) {
          console.error('Error fetching fallback hip hop booking stats:', fallbackError);
          return NextResponse.json(
            { success: false, error: fallbackError.message },
            { status: 500 }
          );
        }

        // Calculate stats for fallback data
        const totalBookings = fallbackData?.length || 0;
        const serviceBreakdown = { 'hbot': totalBookings }; // Default all to HBOT since we can't parse easily
        
        return NextResponse.json({
          success: true,
          summary: {
            totalBookings,
            serviceBreakdown,
            _note: 'Stats from regular bookings table'
          }
        });
      }

      console.error('Error fetching hip hop booking stats:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const totalBookings = data?.length || 0;
    const serviceBreakdown = data?.reduce((acc: Record<string, number>, booking) => {
      acc[booking.service] = (acc[booking.service] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      summary: {
        totalBookings,
        serviceBreakdown
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}