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
      .limit(1);
      
    if (tableCheckError) {
      console.error('Error accessing bookings table:', tableCheckError);
      return NextResponse.json({ error: 'Failed to access bookings table' }, { status: 500 });
    }
    
    // We can't directly execute ALTER TABLE commands with the Supabase JS client
    // So we'll provide SQL instructions for the user to run in the Supabase dashboard
    
    const sqlInstructions = `
-- Run this SQL in your Supabase dashboard SQL editor
-- This fixes the "Could not find the 'age' column of 'bookings' in the schema cache" error

-- Add age column to the bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS age TEXT;

-- Verify the column was added
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name = 'age';
    `;
    
    // Return HTML page with instructions
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Fix Age Column Error</title>
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
            .error {
              background-color: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              margin: 20px 0;
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
          <h1>Fix Age Column Error</h1>
          
          <div class="error">
            <h3>Error: Could not find the 'age' column of 'bookings' in the schema cache</h3>
            <p>This error occurs because your bookings table is missing the 'age' column that the application is trying to use.</p>
          </div>
          
          <div class="steps">
            <h3>Steps to fix the error:</h3>
            <ol>
              <li>Log in to your <a href="https://app.supabase.com" target="_blank">Supabase dashboard</a></li>
              <li>Select your project</li>
              <li>Go to the "SQL Editor" section</li>
              <li>Create a new query</li>
              <li>Copy and paste the SQL below</li>
              <li>Run the query</li>
              <li>Return to your application and refresh the page</li>
            </ol>
          </div>
          
          <h3>SQL to run:</h3>
          <pre>${sqlInstructions}</pre>
          
          <p>
            After running this SQL, your database will have the necessary 'age' column in the bookings table.
            Return to your application and refresh the page.
          </p>
          
          <div style="display: flex; gap: 10px;">
            <a href="/booking" class="button">Go to Booking</a>
            <a href="/admin" class="button" style="background-color: #4b5563;">Go to Admin</a>
          </div>
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
      message: 'Failed to generate fix for age column'
    }, { status: 500 });
  }
} 