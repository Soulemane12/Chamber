import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    
    console.log('Received hip hop booking data:', bookingData);
    
    // Try to insert the booking data first
    // If the table doesn't exist, the error will tell us
    const { data, error } = await supabase
      .from('hip_hop_bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('Error inserting hip hop booking:', error);
      
      // If it's a table not found error, we'll store it in the regular bookings table as a fallback
      if (error.message?.includes('relation "hip_hop_bookings" does not exist')) {
        console.log('hip_hop_bookings table does not exist, using bookings table as fallback');
        
        // Map the data to the regular bookings table format
        const fallbackData = {
          user_id: null, // Guest booking
          first_name: bookingData.first_name,
          last_name: bookingData.last_name,
          email: bookingData.email,
          phone: bookingData.phone,
          location: 'midtown', // Hip hop bookings are for midtown
          date: bookingData.preferred_date,
          time: bookingData.preferred_time,
          duration: '60', // Default duration
          group_size: '1',
          payment_intent_id: 'hip_hop_' + Date.now(), // Unique identifier
          notes: `HIP HOP NOMINEE - Service: ${bookingData.service}. ${bookingData.notes || ''}`,
          amount: 0, // Free for hip hop nominees
          created_at: new Date().toISOString()
        };
        
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('bookings')
          .insert([fallbackData])
          .select();
          
        if (fallbackError) {
          console.error('Error inserting fallback booking:', fallbackError);
          return NextResponse.json(
            { success: false, error: fallbackError.message },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          data: fallbackResult[0],
          message: 'Booking saved successfully (using fallback table)'
        });
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}