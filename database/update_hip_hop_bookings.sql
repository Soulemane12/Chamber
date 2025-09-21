-- Update Hip Hop Bookings Table for Multiple Services Support
-- This script modifies the existing hip_hop_bookings table to support multiple services

-- First, create the table if it doesn't exist (with the updated schema)
CREATE TABLE IF NOT EXISTS hip_hop_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove the old CHECK constraint if it exists (for single service only)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'hip_hop_bookings_service_check' 
    AND table_name = 'hip_hop_bookings'
  ) THEN
    ALTER TABLE hip_hop_bookings DROP CONSTRAINT hip_hop_bookings_service_check;
  END IF;
END $$;

-- Add new CHECK constraint that allows single services or comma-separated combinations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'hip_hop_bookings_service_multiple_check' 
    AND table_name = 'hip_hop_bookings'
  ) THEN
    ALTER TABLE hip_hop_bookings 
    ADD CONSTRAINT hip_hop_bookings_service_multiple_check 
    CHECK (
      service ~ '^(hbot|electric-exercise|pemf|nmr|nutrition)(,\s*(hbot|electric-exercise|pemf|nmr|nutrition))*$'
    );
  END IF;
END $$;

-- Add indexes for better query performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_email ON hip_hop_bookings(email);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_service ON hip_hop_bookings(service);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_date ON hip_hop_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_created_at ON hip_hop_bookings(created_at);

-- Create or replace the trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_hip_hop_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_hip_hop_bookings_updated_at'
    AND event_object_table = 'hip_hop_bookings'
  ) THEN
    CREATE TRIGGER trigger_hip_hop_bookings_updated_at
      BEFORE UPDATE ON hip_hop_bookings
      FOR EACH ROW
      EXECUTE FUNCTION update_hip_hop_bookings_updated_at();
  END IF;
END $$;

-- Add or update comments to document the table structure
COMMENT ON TABLE hip_hop_bookings IS 'Stores booking requests from Hip Hop nominees for wellness services';
COMMENT ON COLUMN hip_hop_bookings.id IS 'Unique identifier for each booking';
COMMENT ON COLUMN hip_hop_bookings.first_name IS 'First name of the Hip Hop nominee';
COMMENT ON COLUMN hip_hop_bookings.last_name IS 'Last name of the Hip Hop nominee';
COMMENT ON COLUMN hip_hop_bookings.email IS 'Email address for booking confirmation';
COMMENT ON COLUMN hip_hop_bookings.phone IS 'Phone number for contact';
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type(s) of wellness service(s) requested. Can be single service (e.g., "hbot") or multiple services (e.g., "hbot, pemf, nutrition"). Valid services: hbot, electric-exercise, pemf, nmr, nutrition';
COMMENT ON COLUMN hip_hop_bookings.preferred_date IS 'Preferred date for the appointment';
COMMENT ON COLUMN hip_hop_bookings.preferred_time IS 'Preferred time slot for the appointment';
COMMENT ON COLUMN hip_hop_bookings.notes IS 'Additional notes or special requests';
COMMENT ON COLUMN hip_hop_bookings.created_at IS 'Timestamp when the booking was created';
COMMENT ON COLUMN hip_hop_bookings.updated_at IS 'Timestamp when the booking was last updated';

-- Example of valid service values:
-- Single service: 'hbot'
-- Multiple services: 'hbot, pemf', 'hbot, electric-exercise, nutrition'
-- The regex constraint ensures only valid service combinations are allowed