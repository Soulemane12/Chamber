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
    // First, get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });
      
    if (bookingsError) {
      console.error('Error accessing bookings table:', bookingsError);
      return NextResponse.json({ error: 'Failed to access bookings table' }, { status: 500 });
    }

    // If no bookings, return empty array
    if (!bookings || bookings.length === 0) {
      return NextResponse.json([]);
    }

    // Get all user IDs from bookings
    const userIds = [...new Set(bookings.map(b => b.user_id))].filter(Boolean);

    // Define the user profile type
    interface UserProfile {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      age?: number;
      gender?: string;
      race?: string;
      education?: string;
      profession?: string;
    }

    // Fetch user profiles in a separate query
    let userProfiles: { [key: string]: UserProfile } = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (!profilesError && profiles) {
        // Create a map of user ID to profile
        userProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    // Format the response to include user data
    const formattedBookings = bookings.map(booking => {
      // Use the user data if available, otherwise use the booking's contact info
      const userProfile = userProfiles[booking.user_id] || null;
      
      // Ensure we always have first_name and last_name, even if user profile is missing
      const firstName = userProfile?.first_name || booking.first_name || '';
      const lastName = userProfile?.last_name || booking.last_name || '';
      const email = userProfile?.email || booking.email || '';
      const phone = userProfile?.phone || booking.phone || '';
      
      return {
        ...booking,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        // Include demographic information directly from booking record if available
        gender: booking.gender || userProfile?.gender,
        race: booking.race || userProfile?.race,
        education: booking.education || userProfile?.education,
        profession: booking.profession || userProfile?.profession,
        age: booking.age || userProfile?.age,
        booking_reason: booking.booking_reason,
        notes: booking.notes,
        user: userProfile ? {
          id: userProfile.id,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          email: userProfile.email,
          phone: userProfile.phone,
          age: userProfile.age,
          gender: userProfile.gender,
          race: userProfile.race,
          education: userProfile.education,
          profession: userProfile.profession
        } : null
      };
    });

    return NextResponse.json(formattedBookings);
  } catch (err) {
    console.error('Error in GET /api/admin/bookings:', err);
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
    
    // First, get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');
      
    if (bookingsError) {
      console.error('Error accessing bookings table:', bookingsError);
      return NextResponse.json({ error: 'Failed to access bookings table' }, { status: 500 });
    }

    // If no bookings, return empty data
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        data: {},
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0
        }
      });
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
        // Get all user IDs from bookings
        const userIds = [...new Set(bookings.map(b => b.user_id))].filter(Boolean);
        
        // Fetch user profiles
        let userProfiles: { [key: string]: any } = {};
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

          if (!profilesError && profiles) {
            // Create a map of user ID to profile
            userProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }
        
        const bookingsByDemographic: Record<string, number> = {};
        
        bookings.forEach(booking => {
          // Get user profile for this booking
          const userProfile = userProfiles[booking.user_id];
          
          // Get demographic value first from booking, then from user profile if not available
          // This prioritizes the data entered at booking time over profile data
          let value = booking[demographic] || userProfile?.[demographic];
          
          // Handle age ranges specifically
          if (demographic === 'age' && value) {
            // If value is already an age range format like "18-24", use it as is
            if (value.includes('-') || value === '65+') {
              // Keep as is
            } else {
              // Otherwise, convert to a range
              const age = Number(value);
              if (age < 25) value = '18-24';
              else if (age < 35) value = '25-34';
              else if (age < 45) value = '35-44';
              else if (age < 55) value = '45-54';
              else if (age < 65) value = '55-64';
              else if (!isNaN(age)) value = '65+';
            }
          }
          
          // Handle null/undefined/empty values
          if (!value) {
            value = 'not_specified';
          } else if (typeof value === 'string') {
            // Convert to title case for consistency
            value = value
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
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