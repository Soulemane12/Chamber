import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface InquiryFormData {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  contactType?: 'business' | 'residential';
  interestLevel?: string;
  product?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const inquiryData: InquiryFormData = await request.json();

    // Safety check for required fields
    if (!inquiryData.email || !inquiryData.name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name and email' },
        { status: 400 }
      );
    }

    // Create a transporter using the same simple configuration as the working app branch
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // User confirmation email
    const userMailOptions = {
      from: '"Wellnex02 Inquiry" <billydduc@gmail.com>',
      to: inquiryData.email,
      subject: 'Thank you for your inquiry - Wellnex02',
      replyTo: 'billydduc@gmail.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">Thank You for Your Inquiry!</h1>
          <p style="text-align: center;">We have received your inquiry and will contact you soon.</p>

          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Your Inquiry Details</h2>

            <p><strong>Name:</strong> ${inquiryData.name}</p>
            <p><strong>Email:</strong> ${inquiryData.email}</p>
            ${inquiryData.phone ? `<p><strong>Phone:</strong> ${inquiryData.phone}</p>` : ''}
            ${inquiryData.contactType ? `<p><strong>Contact Type:</strong> ${inquiryData.contactType === 'business' ? 'Business' : 'Residential'}</p>` : ''}
            ${inquiryData.businessName ? `<p><strong>Business Name:</strong> ${inquiryData.businessName}</p>` : ''}
            ${inquiryData.product ? `<p><strong>Product Interest:</strong> ${inquiryData.product}</p>` : ''}
            ${inquiryData.interestLevel ? `<p><strong>Interest Level:</strong> ${inquiryData.interestLevel}</p>` : ''}
            ${inquiryData.message ? `<p><strong>Message:</strong> ${inquiryData.message}</p>` : ''}
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Owner:</strong> Billy Duc</p>
            <p><strong>Email:</strong> billydduc@gmail.com</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            We will contact you within 24 hours with detailed information about our hyperbaric chamber solutions.
          </p>
        </div>
      `
    };

    // Admin notification email
    const adminMailOptions = {
      from: '"Wellnex02 Inquiry" <billydduc@gmail.com>',
      to: 'billydduc@gmail.com',
      subject: `New Inquiry from ${inquiryData.name}`,
      replyTo: inquiryData.email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">New Inquiry Received!</h1>
          <p style="text-align: center;">A new inquiry has been submitted through the website.</p>

          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Inquiry Details</h2>

            <p><strong>Name:</strong> ${inquiryData.name}</p>
            <p><strong>Email:</strong> ${inquiryData.email}</p>
            ${inquiryData.phone ? `<p><strong>Phone:</strong> ${inquiryData.phone}</p>` : ''}
            ${inquiryData.contactType ? `<p><strong>Contact Type:</strong> ${inquiryData.contactType === 'business' ? 'Business' : 'Residential'}</p>` : ''}
            ${inquiryData.businessName ? `<p><strong>Business Name:</strong> ${inquiryData.businessName}</p>` : ''}
            ${inquiryData.product ? `<p><strong>Product Interest:</strong> ${inquiryData.product}</p>` : ''}
            ${inquiryData.interestLevel ? `<p><strong>Interest Level:</strong> ${inquiryData.interestLevel}</p>` : ''}
            ${inquiryData.message ? `<div><strong>Message:</strong><br/><div style="background-color: #fff; padding: 10px; margin-top: 5px; border-radius: 4px; border-left: 3px solid #3b82f6;">${inquiryData.message.replace(/\n/g, '<br/>')}</div></div>` : ''}
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 5px; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; font-size: 16px; margin-bottom: 10px;">📞 Next Steps</h3>
            <p style="color: #dc2626; margin: 5px 0;">Please follow up with ${inquiryData.name} within 24 hours.</p>
            <p style="color: #dc2626; margin: 5px 0;">Reply directly to this email to contact the customer.</p>
          </div>
        </div>
      `
    };

    try {
      // Send user confirmation email
      const userResult = await transporter.sendMail(userMailOptions);

      // Send admin notification email
      const adminResult = await transporter.sendMail(adminMailOptions);

      return NextResponse.json({
        success: true,
        message: 'Inquiry submitted successfully. We will contact you soon!',
        userMessageId: userResult.messageId,
        adminMessageId: adminResult.messageId
      });
    } catch (emailError) {
      console.error('Error sending email through transporter:', emailError);
      return NextResponse.json(
        { success: false, message: 'Error sending through email service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}