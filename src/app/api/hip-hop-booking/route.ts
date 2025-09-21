import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    
    console.log('Received hip hop booking data:', bookingData);
    
    // Convert services array to single service or comma-separated string for database
    const processedBookingData = {
      ...bookingData,
      // If it's an array, join them; if it's a single service, keep it
      service: Array.isArray(bookingData.services) 
        ? bookingData.services.join(', ') 
        : bookingData.services || bookingData.service,
      // Remove the services array since the table expects 'service'
      services: undefined
    };

    // Try to insert the booking data first
    // If the table doesn't exist, the error will tell us
    const { data, error } = await supabase
      .from('hip_hop_bookings')
      .insert([processedBookingData])
      .select();

    if (error) {
      console.error('Error inserting hip hop booking:', error);
      
      // If it's a table not found error or schema error, we'll store it in the regular bookings table as a fallback
      if (error.message?.includes('relation "hip_hop_bookings" does not exist') || 
          error.message?.includes('column') || 
          error.message?.includes('schema cache')) {
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
          notes: `HIP HOP NOMINEE - Services: ${Array.isArray(bookingData.services) ? bookingData.services.join(', ') : bookingData.services || bookingData.service}. ${bookingData.notes || ''}`,
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
        
        // Send confirmation email for fallback booking
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-hip-hop-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...bookingData,
              // Convert to format expected by email service
              firstName: bookingData.first_name,
              lastName: bookingData.last_name,
              date: new Date(bookingData.preferred_date),
              time: bookingData.preferred_time,
            }),
          });

          const emailResult = await emailResponse.json();
          if (!emailResult.success) {
            console.error('Failed to send Hip Hop confirmation email (fallback):', emailResult.message);
          } else {
            console.log('Hip Hop confirmation email sent successfully (fallback)');
          }
        } catch (emailError) {
          console.error('Error sending Hip Hop confirmation email (fallback):', emailError);
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

    // Send confirmation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-hip-hop-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          // Convert to format expected by email service
          firstName: bookingData.first_name,
          lastName: bookingData.last_name,
          date: new Date(bookingData.preferred_date),
          time: bookingData.preferred_time,
          // Handle both single service (backward compatibility) and multiple services
          services: bookingData.services || [bookingData.service].filter(Boolean),
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResult.success) {
        console.error('Failed to send Hip Hop confirmation email:', emailResult.message);
      } else {
        console.log('Hip Hop confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending Hip Hop confirmation email:', emailError);
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