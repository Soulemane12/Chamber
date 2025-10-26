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

export async function GET(request: Request) {
  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const location = searchParams.get('location') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Build the base query
    let query = supabase.from('bookings').select('*');
    
    // Apply filters
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    if (location && location === 'atmos') {
      query = query.eq('location', location);
    }
    
    // Apply sorting
    if (sortBy && ['date', 'time', 'first_name', 'last_name', 'location', 'amount', 'created_at'].includes(sortBy)) {
      const order = sortOrder === 'asc' ? true : false;
      query = query.order(sortBy, { ascending: order });
    } else {
      // Default sorting by date descending
      query = query.order('date', { ascending: false });
    }
    
    // Execute the query
    const { data: bookings, error: bookingsError } = await query;
      
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
      dob?: string;
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
    let formattedBookings = bookings.map(booking => {
      // Use the user data if available, otherwise use the booking's contact info
      const userProfile = userProfiles[booking.user_id] || null;
      
      // Ensure we always have first_name and last_name, even if user profile is missing
      const firstName = userProfile?.first_name || booking.first_name || '';
      const lastName = userProfile?.last_name || booking.last_name || '';
      const email = userProfile?.email || booking.email || '';
      const phone = userProfile?.phone || booking.phone || '';
      
      // Calculate age from date of birth if available
      let calculatedAge = null;
      if (userProfile?.dob) {
        const dob = new Date(userProfile.dob);
        if (!isNaN(dob.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          
          // Adjust age if birthday hasn't occurred this year yet
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          
          calculatedAge = age;
        }
      }
      
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
        age: booking.age || calculatedAge || null,
        calculated_age: calculatedAge,
        user: userProfile ? {
          id: userProfile.id,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          email: userProfile.email,
          phone: userProfile.phone,
          age: calculatedAge,
          gender: userProfile.gender,
          race: userProfile.race,
          education: userProfile.education,
          profession: userProfile.profession,
          dob: userProfile.dob
        } : null
      };
    });
    
    // Apply text search filter (client-side since we need to search across joined data)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      formattedBookings = formattedBookings.filter(booking => 
        booking.first_name.toLowerCase().includes(query) ||
        booking.last_name.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.phone.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query) ||
        (booking.booking_reason && booking.booking_reason.toLowerCase().includes(query)) ||
        (booking.notes && booking.notes.toLowerCase().includes(query))
      );
    }
    
    // Get total count for pagination
    const total = formattedBookings.length;
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedBookings = formattedBookings.slice(start, end);
    
    // Return paginated results with metadata
    return NextResponse.json({
      data: paginatedBookings,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
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
        const timeData: Record<string, number> = {};
        
        bookings.forEach(booking => {
          if (!booking.date) return;
          
          const formattedDate = formatDateForPeriod(booking.date, period);
          timeData[formattedDate] = (timeData[formattedDate] || 0) + 1;
        });
        
        return NextResponse.json({ data: timeData });
      }
      
      case 'byDemographic': {
        // Get all user IDs from bookings
        const userIds = [...new Set(bookings.map(b => b.user_id))].filter(Boolean);
        
        // Fetch user profiles
        interface ProfileType {
          id: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          dob?: string;
          gender?: string;
          race?: string;
          education?: string;
          profession?: string;
          [key: string]: any; // Allow other properties
        }
        let userProfiles: { [key: string]: ProfileType } = {};
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
        
        const demographicData: Record<string, number> = {};
        
        bookings.forEach(booking => {
          // Get user profile for this booking
          const userProfile = userProfiles[booking.user_id];
          
          // Get demographic value first from booking, then from user profile if not available
          // This prioritizes the data entered at booking time over profile data
          let value = booking[demographic] || userProfile?.[demographic];
          
          // Handle age ranges specifically
          if (demographic === 'age') {
            // If value is already an age range format like "18-24", use it as is
            if (value && (value.includes('-') || value === '65+')) {
              // Keep as is
            } else if (booking.age) {
              // Use booking age if available
              const age = Number(booking.age);
              if (age < 25) value = '18-24';
              else if (age < 35) value = '25-34';
              else if (age < 45) value = '35-44';
              else if (age < 55) value = '45-54';
              else if (age < 65) value = '55-64';
              else if (!isNaN(age)) value = '65+';
            } else if (userProfile?.dob) {
              // Calculate age from date of birth if available
              const dob = new Date(userProfile.dob);
              if (!isNaN(dob.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                
                // Adjust age if birthday hasn't occurred this year yet
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                  age--;
                }
                
                // Assign age group
                if (age < 25) value = '18-24';
                else if (age < 35) value = '25-34';
                else if (age < 45) value = '35-44';
                else if (age < 55) value = '45-54';
                else if (age < 65) value = '55-64';
                else value = '65+';
              }
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
          
          demographicData[value] = (demographicData[value] || 0) + 1;
        });
        
        return NextResponse.json({ data: demographicData });
      }
      
      case 'byLocation': {
        const bookingsByLocation: Record<string, number> = {
          atmos: 0
        };
        
        bookings.forEach(booking => {
          if (booking.location === 'atmos') {
            bookingsByLocation[booking.location] += 1;
          }
        });
        
        return NextResponse.json({ data: bookingsByLocation });
      }
      
      case 'revenue': {
        // Initialize revenue data structure properly
        const allRevenueData: Record<string, number> = {};
        
        // Filter by location if specified
        const filteredBookings = location === 'all' 
          ? bookings 
          : bookings.filter(b => b.location === location);
        
        filteredBookings.forEach(booking => {
          if (!booking.date || !booking.amount) return;
          
          const formattedDate = formatDateForPeriod(booking.date, period);
          allRevenueData[formattedDate] = (allRevenueData[formattedDate] || 0) + Number(booking.amount);
        });
        
        return NextResponse.json({ data: allRevenueData });
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

// Update booking status and chamber assignment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, chamber_id, session_notes, cancelled_reason, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }
    
    // Prepare update data with timestamps for status changes
    const finalUpdateData: any = { ...updateData };
    
    if (status !== undefined) {
      finalUpdateData.status = status;
      
      // Add timestamps for status changes
      if (status === 'completed') {
        finalUpdateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        finalUpdateData.cancelled_at = new Date().toISOString();
        if (cancelled_reason) {
          finalUpdateData.cancelled_reason = cancelled_reason;
        }
      }
    }
    
    if (chamber_id !== undefined) {
      finalUpdateData.chamber_id = chamber_id;
    }
    
    if (session_notes !== undefined) {
      finalUpdateData.session_notes = session_notes;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(finalUpdateData)
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
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Bulk delete bookings
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids;
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
    }
    const { error } = await supabase.from('bookings').delete().in('id', ids);
    if (error) {
      console.error('Delete error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
} 