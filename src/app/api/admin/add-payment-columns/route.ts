import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    const sqlInstructions = `
-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for payment tracking
CREATE INDEX IF NOT EXISTS bookings_payment_status_idx ON public.bookings (payment_status);
CREATE INDEX IF NOT EXISTS bookings_stripe_payment_intent_idx ON public.bookings (stripe_payment_intent_id);
    `;
    
    // Return HTML page with instructions
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Add Payment Columns - Database Setup</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .sql-block { background: #f8f9fa; padding: 20px; border-radius: 4px; border-left: 4px solid #007bff; margin: 20px 0; }
            pre { margin: 0; white-space: pre-wrap; }
            .success { color: #28a745; font-weight: bold; }
            .warning { color: #ffc107; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔧 Add Payment Columns to Database</h1>
            <p class="success">✅ Payment columns setup ready!</p>
            <p>Run this SQL in your Supabase dashboard SQL editor:</p>
            <div class="sql-block">
              <pre>${sqlInstructions}</pre>
            </div>
            <p class="warning">⚠️ This will add payment tracking columns to your existing bookings table.</p>
            <p><strong>What this does:</strong></p>
            <ul>
              <li>Adds <code>payment_status</code> column (default: 'pending')</li>
              <li>Adds <code>stripe_payment_intent_id</code> column for tracking Stripe payments</li>
              <li>Adds <code>updated_at</code> column for tracking updates</li>
              <li>Creates indexes for better performance</li>
            </ul>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error generating payment columns setup:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment columns setup' },
      { status: 500 }
    );
  }
}
