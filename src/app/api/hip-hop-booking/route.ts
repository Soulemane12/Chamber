import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();

    console.log('=== HIP HOP BOOKING REQUEST ===');
    console.log('Raw request body:', JSON.stringify(bookingData, null, 2));
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Received hip hop booking data:', bookingData);
    
    // Convert services array to single service or comma-separated string for database
    const { services, ...restData } = bookingData;
    const processedBookingData = {
      ...restData,
      // If it's an array, join them; if it's a single service, keep it
      service: Array.isArray(services) 
        ? services.join(', ') 
        : services || bookingData.service,
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
      const emailUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/send-hip-hop-email`;
      console.log('Sending Hip Hop email to URL:', emailUrl);
      
      const emailPayload = {
        ...bookingData,
        // Convert to format expected by email service
        firstName: bookingData.first_name || bookingData.firstName,
        lastName: bookingData.last_name || bookingData.lastName,
        date: new Date(bookingData.preferred_date),
        time: bookingData.preferred_time,
        preferred_time: bookingData.preferred_time,
        // Handle both single service (backward compatibility) and multiple services
        services: bookingData.services || [bookingData.service].filter(Boolean),
      };
      
      console.log('Hip Hop email payload:', JSON.stringify(emailPayload, null, 2));

      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      const emailResult = await emailResponse.json();
      console.log('Hip Hop email response:', JSON.stringify(emailResult, null, 2));
      
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