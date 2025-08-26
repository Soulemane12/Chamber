import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { BookingFormData } from '@/components/BookingForm';

import { format } from 'date-fns';



export async function POST(request: Request) {
  try {
    const bookingData: BookingFormData = await request.json();
    
    // Safety check for required fields
    if (!bookingData.email || !bookingData.firstName || !bookingData.date) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking data' },
        { status: 400 }
      );
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD // This should be set in your environment variables
      }
    });

    // Format the date - add safety check
    const dateToFormat = bookingData.date instanceof Date 
      ? bookingData.date 
      : new Date(bookingData.date);
    const formattedDate = format(dateToFormat, 'MMMM d, yyyy');
    
    // All sessions are free
    const groupSize = bookingData.groupSize || "1";
    
    // Update location details to use ATMOS location
    const locationName = 'ATMOS Hyperbaric';
    const locationAddress = '166 laurel rd, east north NY, 11731';



    // Update contact information to match ATMOS
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
            <p><strong>Group Size:</strong> ${groupSize} ${parseInt(groupSize) > 1 ? 'clients' : 'client'}</p>
            <p><strong>Total Amount:</strong> Free</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Owner:</strong> ATMOS Hyperbaric</p>
            <p><strong>Phone:</strong> +1 (646) 262-8794</p>
            <p><strong>Email:</strong> info@atmoshyperbaric.com</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you need to make any changes to your booking, please contact us directly.
          </p>
        </div>
      `
    };

    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Confirmation email sent successfully' 
      });
    } catch (emailError) {
      console.error('Error sending email through transporter:', emailError);
      return NextResponse.json(
        { success: false, message: 'Error sending through email service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
} 