import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { BookingFormData } from '@/components/BookingForm';
import { formatCurrency, isPromotionActive, getPromotionPricing } from '@/lib/utils';
import { format } from 'date-fns';

// Group size multipliers (discount for groups) - same as in BookingForm.tsx
const groupSizeMultipliers = {
  "1": 1.0,    // No discount for single guest
  "2": 1.8,    // 10% discount per guest
  "3": 2.55,   // 15% discount per guest
  "4": 3.2,    // 20% discount per guest
  "5": 3.75,   // 25% discount per guest
};

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
        user: 'b.duc@wellnex02.com',
        pass: process.env.EMAIL_PASSWORD // This should be set in your environment variables
      }
    });

    // Format the date - add safety check
    const dateToFormat = bookingData.date instanceof Date 
      ? bookingData.date 
      : new Date(bookingData.date);
    const formattedDate = format(dateToFormat, 'MMMM d, yyyy');
    
    // Calculate price based on duration
    const prices: Record<string, number> = {
      '60': 150,
      '90': 200,
      '120': 250
    };
    
    // Check if promotion is active
    const isPromoActive = isPromotionActive(bookingData.location, bookingData.date);
    let totalPrice: number;
    if (isPromoActive) {
      // Use promotion pricing - no group discounts during promotion
      const promoPrice = getPromotionPricing(bookingData.duration);
      totalPrice = promoPrice !== null ? promoPrice : (prices[bookingData.duration] || 150);
    } else {
      // Regular pricing with group discounts
      const basePrice = prices[bookingData.duration] || 150;
      const groupSize = bookingData.groupSize || "1";
      const multiplier = groupSizeMultipliers[groupSize as keyof typeof groupSizeMultipliers] || 1.0;
      totalPrice = basePrice * multiplier;
    }
    
    // Location details
    const locationName = bookingData.location === 'midtown' ? 'Midtown Biohack' : 'Platinum Wellness Spa';
    const locationAddress = bookingData.location === 'midtown' 
      ? '575 Madison Ave, 20th floor, New York, NY' 
      : '1900 Parker Rd SE, Conyers, GA 30094';

    // Group discount info - only show when not in promotion
    let discountInfo = '';
    const groupSize = bookingData.groupSize || "1";
    if (!isPromoActive && groupSize !== "1") {
      const discountPercentages = {
        "2": "10%",
        "3": "15%",
        "4": "20%",
        "5": "25%"
      };
      discountInfo = `<p><strong>Group Discount:</strong> ${discountPercentages[groupSize as "2" | "3" | "4" | "5"]} off per guest</p>`;
    }
    
    // Promotion info
    let promotionInfo = '';
    if (isPromoActive) {
      const promoPrice = getPromotionPricing(bookingData.duration);
      if (promoPrice !== null) {
        const regularPrice = prices[bookingData.duration] || 150;
        if (promoPrice < regularPrice) {
          const savings = regularPrice - promoPrice;
          promotionInfo = `
            <div style="margin: 15px 0; padding: 15px; background-color: #fef3c7; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; font-size: 16px; margin-bottom: 10px;">🌟 Special Promotion Applied!</h4>
              <p style="color: #92400e; margin: 5px 0;"><strong>Regular Price:</strong> ${formatCurrency(regularPrice)}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Promotion Price:</strong> ${formatCurrency(promoPrice)}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>You Saved:</strong> ${formatCurrency(savings)}</p>
            </div>
          `;
        }
      }
    }

    // Email content
    const mailOptions = {
      from: 'b.duc@wellnex02.com',
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
            <p><strong>Group Size:</strong> ${groupSize} ${parseInt(groupSize) > 1 ? 'guests' : 'guest'}</p>
            ${discountInfo}
            ${promotionInfo}
            <p><strong>Total Amount:</strong> ${formatCurrency(totalPrice)}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Owner:</strong> Billy Duc</p>
            <p><strong>Phone:</strong> +1 (646) 262-8794</p>
            <p><strong>Email:</strong> b.duc@wellnex02.com</p>
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