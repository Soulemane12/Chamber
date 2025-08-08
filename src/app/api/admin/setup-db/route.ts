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
-- This will create the bookings table and related tables if they don't exist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chambers table
CREATE TABLE IF NOT EXISTS public.chambers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'cleaning')),
  location TEXT NOT NULL DEFAULT 'atmos',
  capacity INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create chamber sessions table to track chamber assignments
CREATE TABLE IF NOT EXISTS public.chamber_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chamber_id UUID REFERENCES public.chambers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(chamber_id, session_date, session_time)
);

-- Create cleaning schedules table
CREATE TABLE IF NOT EXISTS public.cleaning_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chamber_id UUID REFERENCES public.chambers(id) ON DELETE CASCADE,
  cleaning_date DATE NOT NULL,
  cleaning_time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- cleaning duration in minutes
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(chamber_id, cleaning_date, cleaning_time)
);

-- Update bookings table to include status and chamber assignment
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS chamber_id UUID REFERENCES public.chambers(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- Create the main bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL,
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
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  chamber_id UUID REFERENCES public.chambers(id) ON DELETE SET NULL,
  session_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create schedule_slots table for admin-managed availability
CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TEXT NOT NULL,                -- e.g. '9:00 AM'
  duration INTEGER NOT NULL,         -- minutes (60/90/120)
  seats_total INTEGER NOT NULL DEFAULT 4,
  seats_available INTEGER NOT NULL,  -- initially = seats_total
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (date, time)
);

-- Keep seats_available in sync on insert/update
CREATE OR REPLACE FUNCTION public.reset_available()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.seats_available := NEW.seats_total;
  ELSIF TG_OP = 'UPDATE' AND NEW.seats_total <> OLD.seats_total THEN
    NEW.seats_available := NEW.seats_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reset_available
BEFORE INSERT OR UPDATE ON public.schedule_slots
FOR EACH ROW EXECUTE FUNCTION public.reset_available();

-- Reduce seats when a booking is made
CREATE OR REPLACE FUNCTION public.decrement_available()
RETURNS trigger AS $$
BEGIN
  UPDATE public.schedule_slots
  SET seats_available = GREATEST(seats_available - NEW.group_size, 0)
  WHERE date = NEW.date AND time = NEW.time;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_after_booking
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.decrement_available();

-- Function to update chamber session status
CREATE OR REPLACE FUNCTION public.update_chamber_session_status()
RETURNS trigger AS $$
BEGIN
  -- Update chamber session when booking status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.chamber_sessions 
    SET status = NEW.status,
        updated_at = now()
    WHERE booking_id = NEW.id;
    
    -- Update chamber status based on session status
    IF NEW.status = 'in_progress' THEN
      UPDATE public.chambers 
      SET status = 'in_use', updated_at = now()
      WHERE id = NEW.chamber_id;
    ELSIF NEW.status IN ('completed', 'cancelled', 'no_show') THEN
      UPDATE public.chambers 
      SET status = 'available', updated_at = now()
      WHERE id = NEW.chamber_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_chamber_session
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_chamber_session_status();

-- Insert default chambers if they don't exist
INSERT INTO public.chambers (name, description, status, location, capacity) VALUES
  ('Chamber A', 'Primary hyperbaric chamber', 'available', 'atmos', 4),
  ('Chamber B', 'Secondary hyperbaric chamber', 'available', 'atmos', 4),
  ('Chamber C', 'Emergency backup chamber', 'available', 'atmos', 2)
ON CONFLICT (name) DO NOTHING;

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

-- RLS policies for chambers table
ALTER TABLE public.chambers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for chambers" 
  ON public.chambers 
  FOR SELECT 
  USING (true);
CREATE POLICY "Admin write access for chambers" 
  ON public.chambers 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS policies for chamber_sessions table
ALTER TABLE public.chamber_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for chamber sessions" 
  ON public.chamber_sessions 
  FOR SELECT 
  USING (true);
CREATE POLICY "Admin write access for chamber sessions" 
  ON public.chamber_sessions 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS policies for cleaning_schedules table
ALTER TABLE public.cleaning_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for cleaning schedules" 
  ON public.cleaning_schedules 
  FOR SELECT 
  USING (true);
CREATE POLICY "Admin write access for cleaning schedules" 
  ON public.cleaning_schedules 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS policies for schedule_slots table
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for schedule slots" 
  ON public.schedule_slots 
  FOR SELECT 
  USING (true);
CREATE POLICY "Admin write access for schedule slots" 
  ON public.schedule_slots 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create indexes on common query fields
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON public.bookings (date);
CREATE INDEX IF NOT EXISTS bookings_location_idx ON public.bookings (location);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_chamber_id_idx ON public.bookings (chamber_id);

CREATE INDEX IF NOT EXISTS chamber_sessions_chamber_id_idx ON public.chamber_sessions (chamber_id);
CREATE INDEX IF NOT EXISTS chamber_sessions_booking_id_idx ON public.chamber_sessions (booking_id);
CREATE INDEX IF NOT EXISTS chamber_sessions_date_idx ON public.chamber_sessions (session_date);
CREATE INDEX IF NOT EXISTS chamber_sessions_status_idx ON public.chamber_sessions (status);

CREATE INDEX IF NOT EXISTS cleaning_schedules_chamber_id_idx ON public.cleaning_schedules (chamber_id);
CREATE INDEX IF NOT EXISTS cleaning_schedules_date_idx ON public.cleaning_schedules (cleaning_date);

CREATE INDEX IF NOT EXISTS chambers_status_idx ON public.chambers (status);
CREATE INDEX IF NOT EXISTS chambers_location_idx ON public.chambers (location);
    `;
    
    // Return HTML page with instructions
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Database Setup Instructions</title>
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
            .features {
              background-color: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>Database Setup Instructions</h1>
          
          ${tableExists ? 
            `<div class="status success">
              <p>✅ Good news! The bookings table already exists in your database.</p>
            </div>` : 
            `<div class="status warning">
              <p>⚠️ The bookings table does not exist in your database yet.</p>
              <p>Please follow the instructions below to create it.</p>
            </div>`
          }
          
          <div class="features">
            <h3>🚀 New Features Being Added:</h3>
            <ul>
              <li><strong>Chamber Management:</strong> Track hyperbaric chamber status (available, in use, maintenance, cleaning)</li>
              <li><strong>Booking Status:</strong> Real-time session status (confirmed, completed, cancelled, no-show)</li>
              <li><strong>Calendar View:</strong> Daily/weekly/monthly calendar to show all bookings</li>
              <li><strong>Chamber Assignment:</strong> Assign specific chambers to sessions</li>
              <li><strong>Auto-cleaning:</strong> Automatic cleaning time slots between bookings</li>
              <li><strong>Enhanced Scheduling:</strong> Admin-managed availability with seat tracking</li>
            </ul>
          </div>
          
          <div class="steps">
            <h3>Steps to create the database tables:</h3>
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
            After running this SQL, your database will have all the necessary tables for:
          </p>
          <ul>
            <li>Enhanced booking management with status tracking</li>
            <li>Chamber management and assignment</li>
            <li>Automatic cleaning schedules</li>
            <li>Admin-managed availability</li>
          </ul>
          
          <p>Return to your application and refresh the page to see the new features.</p>
          
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