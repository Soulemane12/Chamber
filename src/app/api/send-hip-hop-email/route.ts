import { NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';
import { format } from 'date-fns';

interface HipHopBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service?: string; // Keep for backward compatibility
  services?: string[]; // New field for multiple services
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  date: Date | string;
  time: string;
}

const serviceNames = {
  'hbot': 'Luxury Hyperbaric Oxygen Therapy (HBOT)',
  'electric-exercise': 'Electric Exercise (EMS)',
  'pemf': 'PEMF Therapy',
  'nmr': 'Neuromuscular Reeducation (NMR)',
  'nutrition': 'Personalized Nutrition & Metabolic Optimization'
};

export async function POST(request: Request) {
  try {
    console.log('Hip Hop email API called');
    const bookingData: HipHopBookingData = await request.json();
    console.log('Hip Hop booking data received:', bookingData);
    
    // Safety check for required fields
    if (!bookingData.email || !bookingData.firstName || !bookingData.preferred_date) {
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

    console.log('Creating nodemailer transporter for Hip Hop email');

    // Create a transporter with explicit configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Format the date
    const dateToFormat = bookingData.date instanceof Date 
      ? bookingData.date 
      : new Date(bookingData.preferred_date);
    const formattedDate = format(dateToFormat, 'MMMM d, yyyy');
    
    // Get service names - handle both single and multiple services
    const selectedServices = bookingData.services || [bookingData.service].filter(Boolean);
    const serviceNamesFormatted = selectedServices.map(serviceId => 
      serviceNames[serviceId as keyof typeof serviceNames] || serviceId
    );
    
    // User confirmation email
    const userMailOptions = {
      from: '"Wellnex02 Hip Hop Program" <billydduc@gmail.com>',
      to: bookingData.email,
      subject: 'Hip Hop Nominee Wellness Session - Booking Request Received',
      replyTo: 'billydduc@gmail.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 10px;">🎤 Hip Hop Nominee Wellness Booking</h1>
            <div style="width: 50px; height: 3px; background: linear-gradient(90deg, #7c3aed, #a855f7); margin: 0 auto;"></div>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Dear ${bookingData.firstName},</p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>Congratulations on your Hip Hop nomination!</strong> 🎉
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We've received your wellness session booking request and are excited to support your health and well-being journey. 
            Our team will contact you within 24 hours to confirm your appointment.
          </p>
          
          <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-left: 4px solid #7c3aed; border-radius: 5px;">
            <h2 style="color: #6b21a8; font-size: 20px; margin-bottom: 20px; text-align: center;">Your Booking Request Details</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Email:</strong> ${bookingData.email}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Phone:</strong> ${bookingData.phone}</p>
              </div>
              <div>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Preferred Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Preferred Time:</strong> ${bookingData.preferred_time}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Status:</strong> <span style="color: #059669; font-weight: bold;">Pending Confirmation</span></p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Requested Services:</strong></p>
              <ul style="color: #6b21a8; font-size: 16px; margin: 5px 0; font-weight: 600; list-style: disc; padding-left: 20px;">
                ${serviceNamesFormatted.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('')}
              </ul>
            </div>
            
            ${bookingData.notes ? `
              <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Your Notes:</strong></p>
                <p style="color: #4b5563; margin: 5px 0;">${bookingData.notes}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-left: 4px solid #3b82f6; border-radius: 5px;">
            <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px; text-align: center;">📍 Midtown Biohack Location</h3>
            <div style="text-align: center;">
              <p style="margin: 5px 0; color: #1e40af;"><strong>Address:</strong> 575 Madison Ave, 23rd floor, New York, NY</p>
              <p style="margin: 5px 0; color: #1e40af;"><strong>Contact:</strong> Billy Duc</p>
              <p style="margin: 5px 0; color: #1e40af;"><strong>Email:</strong> billydduc@gmail.com</p>
            </div>
          </div>
          
          <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left: 4px solid #10b981; border-radius: 5px;">
            <h4 style="color: #047857; font-size: 16px; margin-bottom: 10px;">✨ What Happens Next?</h4>
            <ul style="color: #047857; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 5px 0;">Our team will review your request within 24 hours</li>
              <li style="margin: 5px 0;">We'll contact you to confirm your preferred date and time</li>
              <li style="margin: 5px 0;">You'll receive final appointment details via email</li>
              <li style="margin: 5px 0;">Arrive 15 minutes early for your wellness session</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
              Questions about your booking? Reply to this email or contact us directly.
            </p>
            <p style="color: #7c3aed; font-size: 16px; font-weight: 600; margin: 15px 0;">
              Thank you for choosing Wellnex02 & Midtown Biohack for your wellness journey! 🌟
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              This email was sent to confirm your Hip Hop nominee wellness booking request.<br>
              If you did not make this request, please contact us immediately.
            </p>
          </div>
        </div>
      `
    };

    // Admin notification email
    const adminMailOptions = {
      from: '"Wellnex02 Hip Hop Program" <billydduc@gmail.com>',
      to: 'billydduc@gmail.com',
      subject: 'New Hip Hop Nominee Booking Request',
      replyTo: 'billydduc@gmail.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 10px;">🎤 New Hip Hop Booking Request</h1>
            <div style="width: 50px; height: 3px; background: linear-gradient(90deg, #7c3aed, #a855f7); margin: 0 auto;"></div>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            A new Hip Hop nominee has submitted a booking request.
          </p>
          
          <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-left: 4px solid #7c3aed; border-radius: 5px;">
            <h2 style="color: #6b21a8; font-size: 20px; margin-bottom: 20px; text-align: center;">Booking Request Details</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Email:</strong> ${bookingData.email}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Phone:</strong> ${bookingData.phone}</p>
              </div>
              <div>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Preferred Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Preferred Time:</strong> ${bookingData.preferred_time}</p>
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Status:</strong> <span style="color: #dc2626; font-weight: bold;">NEEDS CONFIRMATION</span></p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Requested Services:</strong></p>
              <ul style="color: #6b21a8; font-size: 16px; margin: 5px 0; font-weight: 600; list-style: disc; padding-left: 20px;">
                ${serviceNamesFormatted.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('')}
              </ul>
            </div>
            
            ${bookingData.notes ? `
              <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 8px 0;"><strong style="color: #7c3aed;">Additional Notes:</strong></p>
                <p style="color: #4b5563; margin: 5px 0;">${bookingData.notes}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-left: 4px solid #dc2626; border-radius: 5px;">
            <h4 style="color: #dc2626; font-size: 16px; margin-bottom: 10px;">⚡ Action Required</h4>
            <p style="color: #dc2626; margin: 5px 0;">
              Please contact ${bookingData.firstName} within 24 hours to confirm their appointment.
            </p>
          </div>
        </div>
      `
    };

    try {
      // Test the transporter connection first
      console.log('Testing transporter connection for Hip Hop email...');
      await transporter.verify();
      console.log('Hip Hop email transporter connection verified successfully');
      
      // Send user confirmation email
      console.log('Sending Hip Hop confirmation email to:', bookingData.email);
      console.log('Hip Hop user email options:', {
        from: userMailOptions.from,
        to: userMailOptions.to,
        subject: userMailOptions.subject
      });
      const userResult = await transporter.sendMail(userMailOptions);
      console.log('Hip Hop user confirmation email sent successfully:', userResult.messageId);
      console.log('Hip Hop user email result details:', {
        accepted: userResult.accepted,
        rejected: userResult.rejected,
        pending: userResult.pending,
        response: userResult.response
      });
      
      // Send admin notification email
      console.log('Sending Hip Hop admin notification email to: billydduc@gmail.com');
      const adminResult = await transporter.sendMail(adminMailOptions);
      console.log('Hip Hop admin notification email sent successfully:', adminResult.messageId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Hip Hop emails sent successfully',
        userMessageId: userResult.messageId,
        adminMessageId: adminResult.messageId
      });
    } catch (emailError) {
      console.error('Error sending Hip Hop email through transporter:', emailError);
      console.error('Hip Hop email error details:', {
        code: (emailError as any).code,
        command: (emailError as any).command,
        response: (emailError as any).response,
        responseCode: (emailError as any).responseCode,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error sending Hip Hop confirmation email',
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
    console.error('Error in Hip Hop email service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send Hip Hop confirmation email' },
      { status: 500 }
    );
  }
}