import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    // Check if the bookings table exists
    const { error: tableCheckError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    const tableExists = !tableCheckError;
      
    const sqlInstructions = `
-- Run this SQL in your Supabase dashboard SQL editor
-- This will create the bookings table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  booking_reason TEXT,
  notes TEXT,
  gender TEXT,
  race TEXT,
  education TEXT,
  profession TEXT,
  age TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for the bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY "Users can read their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings" 
  ON public.bookings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role bypass RLS policy for admin operations
CREATE POLICY "Service role bypass RLS" 
  ON public.bookings 
  USING (true);

-- Create index on common query fields
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON public.bookings (date);
CREATE INDEX IF NOT EXISTS bookings_location_idx ON public.bookings (location);
    `;
    
    // Return HTML page with instructions
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Bookings Table Setup Instructions</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 { color: #2563eb; }
            pre {
              background-color: #f1f5f9;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .steps {
              background-color: #f8fafc;
              border-left: 4px solid #2563eb;
              padding: 15px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 10px 15px;
              border-radius: 5px;
              text-decoration: none;
              margin-top: 20px;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            code {
              font-family: monospace;
              background-color: #e2e8f0;
              padding: 2px 4px;
              border-radius: 3px;
            }
            .status {
              padding: 10px 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 500;
            }
            .status.success {
              background-color: #d1fae5;
              color: #047857;
              border-left: 4px solid #047857;
            }
            .status.warning {
              background-color: #fef3c7;
              color: #92400e;
              border-left: 4px solid #92400e;
            }
          </style>
        </head>
        <body>
          <h1>Bookings Table Setup Instructions</h1>
          
          ${tableExists ? 
            `<div class="status success">
              <p>✅ Good news! The bookings table already exists in your database.</p>
            </div>` : 
            `<div class="status warning">
              <p>⚠️ The bookings table does not exist in your database yet.</p>
              <p>Please follow the instructions below to create it.</p>
            </div>`
          }
          
          <div class="steps">
            <h3>Steps to create the bookings table:</h3>
            <ol>
              <li>Log in to your <a href="https://app.supabase.com" target="_blank">Supabase dashboard</a></li>
              <li>Select your project</li>
              <li>Go to the "SQL Editor" section</li>
              <li>Create a new query</li>
              <li>Copy and paste the SQL below</li>
              <li>Run the query</li>
            </ol>
          </div>
          
          <h3>SQL to run:</h3>
          <pre>${sqlInstructions}</pre>
          
          <p>
            After running this SQL, your database will have the necessary table for storing booking information.
            Return to your application and refresh the page to see the changes.
          </p>
          
          <a href="/admin" class="button">Return to Admin Dashboard</a>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ 
      error: 'Error occurred',
      message: 'Failed to check bookings table'
    }, { status: 500 });
  }
} 