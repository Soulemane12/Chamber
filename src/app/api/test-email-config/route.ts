import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const emailPasswordExists = !!process.env.EMAIL_PASSWORD;
    
    return NextResponse.json({
      emailPasswordConfigured: emailPasswordExists,
      message: emailPasswordExists 
        ? 'Email configuration is set up' 
        : 'EMAIL_PASSWORD environment variable is missing'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check email configuration' },
      { status: 500 }
    );
  }
}

