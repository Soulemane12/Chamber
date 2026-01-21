import { NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';
import { BookingFormData } from '@/components/BookingForm';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { getServiceById } from '@/lib/services';

const DEFAULT_CONTACT_EMAIL = 'contact@midtownbiohack.com';

export async function POST(request: Request) {
  try {
    console.log('Email API called');
    const bookingData: BookingFormData = await request.json();
    console.log('Booking data received:', bookingData);
    
    // Safety check for required fields
    if (!bookingData.email || !bookingData.firstName || !bookingData.date) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking data' },
        { status: 400 }
      );
    }

    // Check if email password is configured
    console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
    if (!process.env.EMAIL_PASSWORD) {
      console.error('EMAIL_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Email service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('Creating nodemailer transporter with Gmail service');
    console.log('Email user:', 'billydduc@gmail.com');
    console.log('Password length:', process.env.EMAIL_PASSWORD?.length || 'undefined');

    // Create a transporter exactly like working commit cc6f364
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Format the date - add safety check
    const dateToFormat = bookingData.date instanceof Date 
      ? bookingData.date 
      : new Date(bookingData.date);
    const formattedDate = format(dateToFormat, 'MMMM d, yyyy');
    
    // Calculate price based on selected service
    const selectedService = getServiceById((bookingData as any).service);
    const totalPrice = bookingData.amount ?? selectedService?.price ?? 0;
    
    // Location details
    const locationName = 'Midtown Biohack';
    const locationAddress = '575 Madison Ave, 23rd floor, New York, NY 10022';

    // Contact information
    const contactInfo = {
      owner: 'Dr. Chuck Morris',
      phone: '',
      email: DEFAULT_CONTACT_EMAIL
    };

    const groupSize = bookingData.groupSize || "1";
    const discountInfo = '';
    const promotionInfo = '';

    // User confirmation email
    const userMailOptions = {
      from: `"Midtown Biohack Booking" <${DEFAULT_CONTACT_EMAIL}>`,
      to: bookingData.email,
      subject: selectedService ? `Booking Confirmation: ${selectedService.name}` : 'Your Hyperbaric Chamber Session Confirmation',
      replyTo: DEFAULT_CONTACT_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">Booking Confirmed!</h1>
          <p style="text-align: center;">Thank you for booking.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Booking Details</h2>
            
            <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Date & Time:</strong> ${formattedDate} at ${bookingData.time}</p>
            ${selectedService ? `<p><strong>Service:</strong> ${selectedService.name}</p>` : ''}
            <p><strong>Location:</strong> ${locationName}</p>
            <p><strong>Address:</strong> ${locationAddress}</p>
            <p><strong>Group Size:</strong> ${groupSize} ${parseInt(groupSize) > 1 ? 'guests' : 'guest'}</p>
            ${discountInfo}
            ${promotionInfo}
            <p><strong>Total Amount:</strong> ${totalPrice === 0 ? 'Demo Session - FREE' : formatCurrency(totalPrice)}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Owner:</strong> ${contactInfo.owner}</p>
            ${contactInfo.phone ? `<p><strong>Phone:</strong> ${contactInfo.phone}</p>` : ''}
            <p><strong>Email:</strong> ${contactInfo.email}</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you need to make any changes to your booking, please contact us directly.
          </p>
        </div>
      `
    };

    // Admin notification email
    const adminMailOptions = {
      from: `"Midtown Biohack Booking" <${DEFAULT_CONTACT_EMAIL}>`,
      to: DEFAULT_CONTACT_EMAIL,
      subject: selectedService
        ? `New Booking: ${selectedService.name}`
        : totalPrice === 0 ? 'New Demo Session Booking' : 'New Hyperbaric Chamber Booking',
      replyTo: DEFAULT_CONTACT_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">${totalPrice === 0 ? 'New Demo Session Received!' : 'New Booking Received!'}</h1>
          <p style="text-align: center;">${totalPrice === 0 ? 'A new demo session has been booked (no payment required).' : 'A new hyperbaric chamber session has been booked and paid for.'}</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Booking Details</h2>
            
            <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Date & Time:</strong> ${formattedDate} at ${bookingData.time}</p>
            ${selectedService ? `<p><strong>Service:</strong> ${selectedService.name}</p>` : ''}
          <p><strong>Location:</strong> ${locationName}</p>
          <p><strong>Address:</strong> ${locationAddress}</p>
          <p><strong>Group Size:</strong> ${groupSize} ${parseInt(groupSize) > 1 ? 'guests' : 'guest'}</p>
            ${discountInfo}
            ${promotionInfo}
            <p><strong>Total Amount:</strong> ${totalPrice === 0 ? 'Demo Session - FREE' : formatCurrency(totalPrice)}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: ${totalPrice === 0 ? '#fef3c7' : '#ecfdf5'}; border-radius: 5px; border-left: 4px solid ${totalPrice === 0 ? '#f59e0b' : '#10b981'};">
            <h3 style="color: ${totalPrice === 0 ? '#92400e' : '#047857'}; font-size: 16px; margin-bottom: 10px;">${totalPrice === 0 ? '🎉 Demo Session' : '✅ Payment Status'}</h3>
            <p style="color: ${totalPrice === 0 ? '#92400e' : '#047857'}; margin: 5px 0;">${totalPrice === 0 ? 'Demo session - no payment required' : 'Payment completed successfully'}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 5px; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; font-size: 16px; margin-bottom: 10px;">📞 Next Steps</h3>
            <p style="color: #dc2626; margin: 5px 0;">Please prepare for the session and contact the customer if needed.</p>
          </div>
        </div>
      `
    };

    try {
      // Test the transporter connection first
      console.log('Testing transporter connection...');
      await transporter.verify();
      console.log('Transporter connection verified successfully');
      
      // Send user confirmation email
      console.log('Sending confirmation email to:', bookingData.email);
      console.log('User email options:', {
        from: userMailOptions.from,
        to: userMailOptions.to,
        subject: userMailOptions.subject
      });
      const userResult = await transporter.sendMail(userMailOptions);
      console.log('User confirmation email sent successfully:', userResult.messageId);
      console.log('User email result details:', {
        accepted: userResult.accepted,
        rejected: userResult.rejected,
        pending: userResult.pending,
        response: userResult.response
      });
      
      // Send admin notification email
      console.log('Sending admin notification email to:', DEFAULT_CONTACT_EMAIL);
      const adminResult = await transporter.sendMail(adminMailOptions);
      console.log('Admin notification email sent successfully:', adminResult.messageId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Emails sent successfully',
        userMessageId: userResult.messageId,
        adminMessageId: adminResult.messageId
      });
    } catch (emailError) {
      console.error('Error sending email through transporter:', emailError);
      console.error('Email error details:', {
        code: (emailError as any).code,
        command: (emailError as any).command,
        response: (emailError as any).response,
        responseCode: (emailError as any).responseCode,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error sending through email service',
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          details: {
            code: (emailError as any).code,
            command: (emailError as any).command,
            responseCode: (emailError as any).responseCode,
          }
        },
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
