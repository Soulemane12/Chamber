import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Create a Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Cache for storing data to avoid repeated database queries
let dataCache: {
  bookings?: any[];
  users?: any[];
  bookingsByDemographic?: {
    age: Record<string, number>;
    gender: Record<string, number>;
    race: Record<string, number>;
    education: Record<string, number>;
    profession: Record<string, number>;
  };
  bookingsByTimePeriod?: {
    day: Record<string, number>;
    month: Record<string, number>;
    quarter: Record<string, number>;
    year: Record<string, number>;
  };
  summaryStats?: any;
  lastUpdated?: Date;
} = {};

// Helper function to format date for analytics
const formatDateForPeriod = (date: string, period: 'day' | 'month' | 'quarter' | 'year') => {
  const d = new Date(date);
  switch (period) {
    case 'day':
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
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

// Function to calculate age from date of birth
const calculateAge = (dob: string): number | null => {
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (e) {
    return null;
  }
};

// Function to get age group from age
function getAgeGroup(age: number | null): string {
  if (age === null) return 'Unknown';
  if (age < 18) return 'Under 18';
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60+';
}

// Function to fetch all required data
async function fetchAllData() {
  try {
    const now = new Date();
    // Only refresh cache if it's older than 5 minutes
    if (dataCache.lastUpdated && now.getTime() - dataCache.lastUpdated.getTime() < 5 * 60 * 1000) {
      return dataCache;
    }

    // Fetch bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw new Error('Failed to fetch bookings data');
    }

    // Fetch users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch users data');
    }

    // Calculate summary stats
    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0) || 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Analyze bookings by time period
    const bookingsByTimePeriod = {
      day: {} as Record<string, number>,
      month: {} as Record<string, number>,
      quarter: {} as Record<string, number>,
      year: {} as Record<string, number>
    };

    // Analyze bookings by demographic
    const bookingsByDemographic = {
      age: {} as Record<string, number>,
      gender: {} as Record<string, number>,
      race: {} as Record<string, number>,
      education: {} as Record<string, number>,
      profession: {} as Record<string, number>
    };

    // Create a map of user ID to profile
    const userProfiles = users?.reduce((acc: Record<string, any>, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {}) || {};

    // Process bookings for analytics
    bookings?.forEach(booking => {
      if (!booking.date) return;
      
      // Process time periods
      ['day', 'month', 'quarter', 'year'].forEach(period => {
        const formattedDate = formatDateForPeriod(booking.date, period as any);
        bookingsByTimePeriod[period as keyof typeof bookingsByTimePeriod][formattedDate] = 
          (bookingsByTimePeriod[period as keyof typeof bookingsByTimePeriod][formattedDate] || 0) + 1;
      });

      // Get user profile for this booking
      const userProfile = userProfiles[booking.user_id];
      
      // Process demographics
      // Age
      let age = booking.age;
      if (!age && userProfile?.dob) {
        age = calculateAge(userProfile.dob);
      }
      const ageGroup = getAgeGroup(age as number | null);
      bookingsByDemographic.age[ageGroup] = (bookingsByDemographic.age[ageGroup] || 0) + 1;
      
      // Gender
      const gender = (booking.gender || userProfile?.gender || 'Unknown').toString();
      bookingsByDemographic.gender[gender] = (bookingsByDemographic.gender[gender] || 0) + 1;
      
      // Race
      const race = (booking.race || userProfile?.race || 'Unknown').toString();
      bookingsByDemographic.race[race] = (bookingsByDemographic.race[race] || 0) + 1;
      
      // Education
      const education = (booking.education || userProfile?.education || 'Unknown').toString();
      bookingsByDemographic.education[education] = (bookingsByDemographic.education[education] || 0) + 1;
      
      // Profession
      const profession = (booking.profession || userProfile?.profession || 'Unknown').toString();
      bookingsByDemographic.profession[profession] = (bookingsByDemographic.profession[profession] || 0) + 1;
    });

    // Update cache
    dataCache = {
      bookings,
      users,
      bookingsByTimePeriod,
      bookingsByDemographic,
      summaryStats: {
        totalBookings,
        totalRevenue,
        averageBookingValue,
      },
      lastUpdated: now,
    };

    return dataCache;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Missing message parameter' }, { status: 400 });
    }

    // Verify that GROQ API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    // Check if this is a document request
    const isDocumentRequest = /(generate|create|make|download|get).*(report|document|pdf|file)/i.test(message);
    
    if (isDocumentRequest) {
      return NextResponse.json({ 
        response: "I can help you generate PDF documents! Please use the document generation feature in the chat interface. You can ask for:\n\n• Booking reports\n• User reports\n• Revenue reports\n• Custom documents\n\nJust type your request and I'll create a downloadable PDF for you."
      });
    }

    // Fetch data for context
    let data;
    try {
      data = await fetchAllData();
    } catch (error) {
      console.error('Error fetching data for chatbot:', error);
      return NextResponse.json({ 
        response: "Sorry, I had trouble accessing the database. Please try again or contact system support."
      });
    }
    
    // Format the demographic data for better readability
    const formatDemographicData = (data: Record<string, number>) => {
      return Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    };
    
    // Get the top months for bookings
    const getTopBookingMonths = () => {
      const monthData = data.bookingsByTimePeriod?.month || {};
      return Object.entries(monthData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([month, count]) => `${month}: ${count}`)
        .join(', ');
    };
    
    // Get location distribution
    const getLocationDistribution = () => {
      const locationCounts: Record<string, number> = {};
      data.bookings?.forEach(booking => {
        const location = booking.location || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      return Object.entries(locationCounts)
        .map(([location, count]) => `${location}: ${count} (${((count / (data.summaryStats?.totalBookings || 1)) * 100).toFixed(1)}%)`)
        .join(', ');
    };

    // Prepare context with summary of data
    const contextString = `
Current system state:
- Total users: ${data.users?.length || 0}
- Total bookings: ${data.summaryStats?.totalBookings || 0}
- Total revenue: $${data.summaryStats?.totalRevenue.toFixed(2) || 0}
- Average booking value: $${data.summaryStats?.averageBookingValue.toFixed(2) || 0}

Demographic Data:
- Age groups: ${formatDemographicData(data.bookingsByDemographic?.age || {})}
- Gender: ${formatDemographicData(data.bookingsByDemographic?.gender || {})}
- Race: ${formatDemographicData(data.bookingsByDemographic?.race || {})}
- Education: ${formatDemographicData(data.bookingsByDemographic?.education || {})}
- Profession: ${formatDemographicData(data.bookingsByDemographic?.profession || {})}

Booking Trends:
- Top booking months: ${getTopBookingMonths()}
- Location distribution: ${getLocationDistribution()}
- Last data update: ${data.lastUpdated?.toLocaleString() || 'unknown'}

User question: ${message}
`;

    // Call Groq API using the SDK
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Using Llama model
      messages: [
        {
          role: 'system',
          content: `You are an administrative assistant for a hyperbaric oxygen therapy (HBOT) booking system. 
          You have access to real-time data about users, bookings, and analytics. 
          Respond in a helpful, concise manner with insights based on the provided data. 
          If asked for specific data that isn't available in the context, say that you'd need to query the database for that information.
          Keep responses brief but informative and data-driven.`
        },
        {
          role: 'user',
          content: contextString
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_completion_tokens: 500
    });

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json({ 
      response: "Sorry, an error occurred while processing your request. Please try again."
    }, { status: 500 });
  }
} 