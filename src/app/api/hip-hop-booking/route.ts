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

    // Insert the booking data into hip_hop_bookings table
    const { data, error } = await supabase
      .from('hip_hop_bookings')
      .insert([processedBookingData])
      .select();

    if (error) {
      console.error('Error inserting hip hop booking:', error);
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