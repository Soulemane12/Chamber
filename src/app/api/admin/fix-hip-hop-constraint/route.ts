import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    // Check if the hip_hop_bookings table exists
    const { error: tableCheckError } = await supabase
      .from('hip_hop_bookings')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Error accessing hip_hop_bookings table:', tableCheckError);
      return NextResponse.json({ error: 'Failed to access hip_hop_bookings table' }, { status: 500 });
    }
    
    const sqlInstructions = `
-- Run this SQL in your Supabase dashboard SQL editor
-- This will fix the hip_hop_bookings_service_check constraint to include 'ifs' service

-- Drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint that includes 'ifs'
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check 
CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs';
    `;
    
    // Return HTML page with instructions
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Fix Hip Hop Bookings Constraint</title>
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
            .alert {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              color: #92400e;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
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
          </style>
        </head>
        <body>
          <h1>Fix Hip Hop Bookings Constraint</h1>
          
          <div class="alert">
            <strong>Issue:</strong> The hip-hop booking form includes an "ifs" (Internal Family Systems) service option, 
            but the database constraint doesn't allow it, causing booking submissions to fail.
          </div>
          
          <p>
            To fix this constraint violation error, please follow these steps to update your database:
          </p>
          
          <div class="steps">
            <h3>Steps to fix the constraint:</h3>
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
            After running this SQL, the hip-hop booking form will work correctly and users will be able to select the "ifs" service option without errors.
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
      message: 'Please check your database connection and try again'
    }, { status: 500 });
  }
}
