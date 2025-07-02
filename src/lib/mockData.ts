// Mock booking data for admin dashboard

export interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  time: string;
  duration: string;
  location: 'midtown' | 'conyers';
  amount: number;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  race?: string;
  education?: string;
  profession?: string;
}

// Generate random dates within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock bookings
function generateMockBookings(count: number): Booking[] {
  const locations = ['midtown', 'conyers'] as const;
  const durations = ['60', '90', '120'] as const;
  const genders = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
  const races = ['White', 'Black', 'Hispanic', 'Asian', 'Other'];
  const educations = ['High School', 'Bachelor', 'Master', 'PhD', 'Other'];
  const professions = ['Healthcare', 'Technology', 'Education', 'Finance', 'Other'];
  
  const startDate = new Date(2023, 0, 1); // Jan 1, 2023
  const endDate = new Date(); // Today
  
  const bookings: Booking[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = randomDate(startDate, endDate);
    const location = locations[Math.floor(Math.random() * locations.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const amount = duration === '60' ? 150 : (duration === '90' ? 200 : 250);
    
    bookings.push({
      id: `booking-${i + 1}`,
      firstName: `FirstName${i + 1}`,
      lastName: `LastName${i + 1}`,
      email: `user${i + 1}@example.com`,
      date: date.toISOString().split('T')[0],
      time: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 6)],
      duration,
      location,
      amount,
      age: Math.floor(Math.random() * 50) + 18, // Random age between 18-68
      gender: genders[Math.floor(Math.random() * genders.length)],
      race: races[Math.floor(Math.random() * races.length)],
      education: educations[Math.floor(Math.random() * educations.length)],
      profession: professions[Math.floor(Math.random() * professions.length)]
    });
  }
  
  return bookings;
}

// Mock data for the admin dashboard
export const mockBookings = generateMockBookings(200);

// Get bookings by time period
export function getBookingsByTimePeriod(period: 'day' | 'month' | 'quarter' | 'year') {
  const now = new Date();
  const bookings = [...mockBookings];
  
  // Sort bookings by date
  bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group bookings by the specified period
  const groupedBookings: Record<string, number> = {};
  
  // First, create empty entries for recent periods to ensure we have a complete timeline
  if (period === 'day') {
    // Create entries for the last 15 days
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      groupedBookings[key] = 0;
    }
  } else if (period === 'month') {
    // Create entries for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      groupedBookings[key] = 0;
    }
  } else if (period === 'quarter') {
    // Create entries for the last 8 quarters
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i * 3);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `${date.getFullYear()}-Q${quarter}`;
      groupedBookings[key] = 0;
    }
  } else if (period === 'year') {
    // Create entries for the last 5 years
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - i);
      const key = date.getFullYear().toString();
      groupedBookings[key] = 0;
    }
  }
  
  // Now count actual bookings
  bookings.forEach(booking => {
    const bookingDate = new Date(booking.date);
    let key = '';
    
    if (period === 'day') {
      key = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'month') {
      key = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else if (period === 'quarter') {
      const quarter = Math.floor(bookingDate.getMonth() / 3) + 1;
      key = `${bookingDate.getFullYear()}-Q${quarter}`;
    } else if (period === 'year') {
      key = bookingDate.getFullYear().toString();
    }
    
    // Only count if it's a key we're displaying (recent periods)
    if (groupedBookings[key] !== undefined) {
      groupedBookings[key]++;
    }
  });
  
  return groupedBookings;
}

// Get bookings by demographic
export function getBookingsByDemographic(demographic: 'age' | 'gender' | 'race' | 'education' | 'profession') {
  const result: Record<string, number> = {};
  
  mockBookings.forEach(booking => {
    let value: string | undefined;
    
    if (demographic === 'age') {
      if (booking.age) {
        // Group ages into ranges
        if (booking.age < 25) value = '18-24';
        else if (booking.age < 35) value = '25-34';
        else if (booking.age < 45) value = '35-44';
        else if (booking.age < 55) value = '45-54';
        else if (booking.age < 65) value = '55-64';
        else value = '65+';
      }
    } else if (demographic === 'gender') {
      value = booking.gender;
    } else if (demographic === 'race') {
      value = booking.race;
    } else if (demographic === 'education') {
      value = booking.education;
    } else if (demographic === 'profession') {
      value = booking.profession;
    }
    
    if (value) {
      if (!result[value]) {
        result[value] = 0;
      }
      result[value]++;
    }
  });
  
  return result;
}

// Get average bookings per location
export function getAverageBookingsByLocation() {
  const locationCounts: Record<string, number> = {};
  
  mockBookings.forEach(booking => {
    if (!locationCounts[booking.location]) {
      locationCounts[booking.location] = 0;
    }
    locationCounts[booking.location]++;
  });
  
  return {
    midtown: locationCounts.midtown || 0,
    conyers: locationCounts.conyers || 0
  };
}

// Get booking revenue by location and time period
export function getBookingRevenueByLocation(
  location: 'midtown' | 'conyers' | 'all',
  period: 'day' | 'week' | 'month' | 'year'
) {
  const now = new Date();
  const filteredBookings = location === 'all' 
    ? mockBookings 
    : mockBookings.filter(booking => booking.location === location);
  
  // Group bookings by the specified period
  const groupedRevenue: Record<string, number> = {};
  
  // First, create empty entries for recent periods to ensure we have a complete timeline
  if (period === 'day') {
    // Create entries for the last 15 days
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      groupedRevenue[key] = 0;
    }
  } else if (period === 'week') {
    // Create entries for the last 10 weeks
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      // Get the week number
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const key = `${date.getFullYear()}-W${weekNumber}`;
      groupedRevenue[key] = 0;
    }
  } else if (period === 'month') {
    // Create entries for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      groupedRevenue[key] = 0;
    }
  } else if (period === 'year') {
    // Create entries for the last 5 years
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - i);
      const key = date.getFullYear().toString();
      groupedRevenue[key] = 0;
    }
  }
  
  // Now calculate revenue from actual bookings
  filteredBookings.forEach(booking => {
    const bookingDate = new Date(booking.date);
    let key = '';
    
    if (period === 'day') {
      key = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'week') {
      // Get the week number
      const firstDayOfYear = new Date(bookingDate.getFullYear(), 0, 1);
      const pastDaysOfYear = (bookingDate.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${bookingDate.getFullYear()}-W${weekNumber}`;
    } else if (period === 'month') {
      key = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else if (period === 'year') {
      key = bookingDate.getFullYear().toString();
    }
    
    // Only add revenue if it's a key we're displaying (recent periods)
    if (groupedRevenue[key] !== undefined) {
      groupedRevenue[key] += booking.amount;
    }
  });
  
  return groupedRevenue;
} 