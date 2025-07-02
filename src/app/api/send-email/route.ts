import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { BookingFormData } from '@/components/BookingForm';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const bookingData: BookingFormData = await request.json();
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD // This should be set in your environment variables
      }
    });

    // Format the date
    const formattedDate = format(new Date(bookingData.date), 'MMMM d, yyyy');
    
    // Calculate price based on duration
    const prices: Record<string, number> = {
      '60': 150,
      '90': 200,
      '120': 250
    };
    const price = prices[bookingData.duration] || 150;
    
    // Location details
    const locationName = bookingData.location === 'midtown' ? 'Midtown Biohack' : 'Platinum Wellness Spa';
    const locationAddress = bookingData.location === 'midtown' 
      ? '575 Madison Ave, 20th floor, New York, NY' 
      : '1900 Parker Rd SE, Conyers, GA 30094';

    // Email content
    const mailOptions = {
      from: 'billydduc@gmail.com',
      to: bookingData.email,
      subject: 'Your Hyperbaric Chamber Session Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">Booking Confirmed!</h1>
          <p style="text-align: center;">Thank you for booking your hyperbaric chamber session.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Booking Details</h2>
            
            <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Date & Time:</strong> ${formattedDate} at ${bookingData.time}</p>
            <p><strong>Duration:</strong> ${bookingData.duration} minutes</p>
            <p><strong>Location:</strong> ${locationName}</p>
            <p><strong>Address:</strong> ${locationAddress}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(price)}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Owner:</strong> Billy Duc</p>
            <p><strong>Phone:</strong> +1 (646) 262-8794</p>
            <p><strong>Email:</strong> billydduc@gmail.com</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you need to make any changes to your booking, please contact us directly.
          </p>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
} 