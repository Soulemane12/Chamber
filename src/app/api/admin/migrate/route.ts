import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    // Check if the profiles table exists and is accessible
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Error accessing profiles table:', tableCheckError);
      return NextResponse.json({ error: 'Failed to access profiles table' }, { status: 500 });
    }
    
    // We can't directly execute ALTER TABLE commands with the Supabase JS client
    // So we'll provide SQL instructions for the user to run in the Supabase dashboard
    
    const sqlInstructions = `
-- Run this SQL in your Supabase dashboard SQL editor
-- This will ensure we have all required columns in your profiles and bookings tables

-- Ensure we have the full_name column (in case we need to migrate from name to full_name)
DO $$
BEGIN
    -- Check if 'name' column exists but 'full_name' doesn't
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'full_name'
    ) THEN
        -- Add full_name column and copy data from name
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        UPDATE public.profiles SET full_name = name;
        ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;
    END IF;
END $$;

-- Add demographic columns if they don't exist in profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS race TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT;

-- IMPORTANT: Add demographic columns to bookings table if they don't exist
-- This fixes the "Could not find the 'age' column of 'bookings' in the schema cache" error
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS race TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS age TEXT,
ADD COLUMN IF NOT EXISTS booking_reason TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;
    `;
    
    // Return HTML page with instructions
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Database Migration Instructions</title>
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
          </style>
        </head>
        <body>
          <h1>Database Migration Instructions</h1>
          <p>
            Your application needs to update the database tables in your Supabase database.
            Please follow these steps to complete the migration:
          </p>
          
          <div class="steps">
            <h3>Steps to add the missing columns:</h3>
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
            After running this SQL, your database will have the necessary columns for storing demographic information.
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
      message: 'Please check your database table structures and ensure they have the necessary columns'
    }, { status: 500 });
  }
} 