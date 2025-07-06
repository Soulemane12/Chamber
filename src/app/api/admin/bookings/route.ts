import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Helper function to format date for analytics
const formatDateForPeriod = (date: string, period: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
  const d = new Date(date);
  switch (period) {
    case 'day':
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'week':
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      return `${weekStart.toISOString().split('T')[0]}`; // Week of YYYY-MM-DD
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    case 'quarter':
      const quarter = Math.floor(d.getMonth() / 3) + 1;
      return `${d.getFullYear()}-Q${quarter}`; // YYYY-Q#
    case 'year':
      return `${d.getFullYear()}`; // YYYY
    default:
      return d.toISOString().split('T')[0];
  }
};

export async function GET() {
  try {
    // Check if the bookings table exists
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });
      
    if (bookingsError) {
      console.error('Error accessing bookings table:', bookingsError);
      return NextResponse.json({ error: 'Failed to access bookings table' }, { status: 500 });
    }

    return NextResponse.json(bookings);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ 
      error: 'Error occurred',
      message: 'Failed to fetch bookings data'
    }, { status: 500 });
  }
}

// Endpoint to get aggregated booking data for analytics
export async function POST(request: Request) {
  try {
    const { type, period, demographic, location } = await request.json();
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');
      
    if (bookingsError) {
      console.error('Error accessing bookings table:', bookingsError);
      return NextResponse.json({ error: 'Failed to access bookings table' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ data: {} });
    }

    // Calculate various statistics based on the request type
    switch (type) {
      case 'byTimePeriod': {
        const bookingsByTime: Record<string, number> = {};
        
        bookings.forEach(booking => {
          if (!booking.date) return;
          
          const formattedDate = formatDateForPeriod(booking.date, period);
          bookingsByTime[formattedDate] = (bookingsByTime[formattedDate] || 0) + 1;
        });
        
        return NextResponse.json({ data: bookingsByTime });
      }
      
      case 'byDemographic': {
        const bookingsByDemographic: Record<string, number> = {};
        
        bookings.forEach(booking => {
          let value = booking[demographic];
          
          // Handle null/undefined values
          if (!value) {
            value = 'not_specified';
          }
          
          bookingsByDemographic[value] = (bookingsByDemographic[value] || 0) + 1;
        });
        
        return NextResponse.json({ data: bookingsByDemographic });
      }
      
      case 'byLocation': {
        const bookingsByLocation: Record<string, number> = {
          midtown: 0,
          conyers: 0
        };
        
        bookings.forEach(booking => {
          if (booking.location === 'midtown' || booking.location === 'conyers') {
            bookingsByLocation[booking.location] += 1;
          }
        });
        
        return NextResponse.json({ data: bookingsByLocation });
      }
      
      case 'revenue': {
        const revenueData: Record<string, number> = {};
        
        // Filter by location if specified
        const filteredBookings = location === 'all' 
          ? bookings 
          : bookings.filter(b => b.location === location);
        
        filteredBookings.forEach(booking => {
          if (!booking.date || !booking.amount) return;
          
          const formattedDate = formatDateForPeriod(booking.date, period);
          revenueData[formattedDate] = (revenueData[formattedDate] || 0) + Number(booking.amount);
        });
        
        return NextResponse.json({ data: revenueData });
      }
      
      case 'summary': {
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        
        return NextResponse.json({
          data: {
            totalBookings,
            totalRevenue,
            averageBookingValue
          }
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ 
      error: 'Error occurred',
      message: 'Failed to process analytics request'
    }, { status: 500 });
  }
} 