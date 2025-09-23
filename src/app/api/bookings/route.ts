import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    if (action === 'send-email') {
      console.log('=== BOOKING EMAIL REQUEST ===');
      console.log('Sending booking confirmation email directly...');
      console.log('Booking data:', JSON.stringify(data, null, 2));

      // Import and call the email service directly
      const { POST: sendEmail } = await import('../send-email/route');
      const emailRequest = new Request('http://localhost/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const emailResponse = await sendEmail(emailRequest);
      const emailResult = await emailResponse.json();

      console.log('Booking email response:', JSON.stringify(emailResult, null, 2));

      if (!emailResult.success) {
        console.error('Failed to send booking confirmation email:', emailResult.message);
        return NextResponse.json({
          success: false,
          message: emailResult.message || 'Failed to send confirmation email'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Booking confirmation email sent successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in booking API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}