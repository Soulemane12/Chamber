import { NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

const DEFAULT_CONTACT_EMAIL = 'contact@midtownbiohack.com';

interface CreditEmailData {
  customerEmail: string;
  customerName?: string;
  creditType: string;
  creditAmount: number;
  expirationDays: number;
  notes?: string;
}

const getCreditTypeDisplayName = (type: string): string => {
  const names: Record<string, string> = {
    'gray_matter': 'Gray Matter Recovery',
    'optimal_wellness': 'Optimal Wellness',
    'challenge': 'Challenge Program',
    'hbot': 'HBOT Session'
  };
  return names[type] || type;
};

export async function POST(request: Request) {
  try {
    const data: CreditEmailData = await request.json();

    if (!data.customerEmail || !data.creditType || !data.creditAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required data' },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_PASSWORD) {
      console.error('EMAIL_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'billydduc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const creditTypeName = getCreditTypeDisplayName(data.creditType);
    const expirationText = data.expirationDays > 0
      ? `${data.expirationDays} days from today`
      : 'No expiration';

    // Customer confirmation email
    const customerMailOptions = {
      from: `"Midtown Biohack" <${DEFAULT_CONTACT_EMAIL}>`,
      to: data.customerEmail,
      subject: `You've Received ${data.creditAmount} ${creditTypeName} Credits!`,
      replyTo: DEFAULT_CONTACT_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin-bottom: 10px;">Credits Added to Your Account!</h1>
            <p style="color: #6b7280; font-size: 16px;">Great news! You've received credits for Midtown Biohack services.</p>
          </div>

          <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); border-radius: 10px; color: white;">
            <h2 style="font-size: 24px; margin-bottom: 15px; text-align: center;">${data.creditAmount} ${creditTypeName} Credits</h2>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Credit Type:</strong> ${creditTypeName}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${data.creditAmount} session${data.creditAmount > 1 ? 's' : ''}</p>
              <p style="margin: 5px 0;"><strong>Expires:</strong> ${expirationText}</p>
              ${data.notes ? `<p style="margin: 5px 0;"><strong>Note:</strong> ${data.notes}</p>` : ''}
            </div>
          </div>

          <div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <h3 style="color: #166534; font-size: 16px; margin-bottom: 10px;">How to Use Your Credits</h3>
            <ol style="color: #166534; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Visit our booking page at midtownbiohack.com</li>
              <li style="margin-bottom: 8px;">Log in to your account</li>
              <li style="margin-bottom: 8px;">Select a ${creditTypeName} service</li>
              <li style="margin-bottom: 8px;">Your credits will be automatically applied at checkout</li>
            </ol>
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Questions?</h3>
            <p style="color: #1e40af; margin: 5px 0;">Contact us at ${DEFAULT_CONTACT_EMAIL}</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            Thank you for being a valued client of Midtown Biohack!
          </p>
        </div>
      `
    };

    // Admin notification email
    const adminMailOptions = {
      from: `"Midtown Biohack Admin" <${DEFAULT_CONTACT_EMAIL}>`,
      to: DEFAULT_CONTACT_EMAIL,
      subject: `Credits Granted: ${data.creditAmount} ${creditTypeName} to ${data.customerEmail}`,
      replyTo: DEFAULT_CONTACT_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #7c3aed; text-align: center;">Credits Granted</h1>
          <p style="text-align: center;">An admin has granted credits to a customer.</p>

          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 5px;">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px;">Details</h2>
            <p><strong>Customer Email:</strong> ${data.customerEmail}</p>
            <p><strong>Credit Type:</strong> ${creditTypeName}</p>
            <p><strong>Amount:</strong> ${data.creditAmount} session${data.creditAmount > 1 ? 's' : ''}</p>
            <p><strong>Expiration:</strong> ${expirationText}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
        </div>
      `
    };

    try {
      await transporter.verify();

      // Send customer email
      const customerResult = await transporter.sendMail(customerMailOptions);
      console.log('Credit confirmation email sent to customer:', customerResult.messageId);

      // Send admin notification
      const adminResult = await transporter.sendMail(adminMailOptions);
      console.log('Credit notification email sent to admin:', adminResult.messageId);

      return NextResponse.json({
        success: true,
        message: 'Credit confirmation emails sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending credit email:', emailError);
      return NextResponse.json(
        { success: false, message: 'Error sending email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in credit email API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send credit confirmation email' },
      { status: 500 }
    );
  }
}
