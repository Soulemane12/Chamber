-- Hip Hop Nominees Booking Table
-- This table stores booking requests from Hip Hop nominees for wellness services

CREATE TABLE IF NOT EXISTS hip_hop_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition')),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_email ON hip_hop_bookings(email);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_service ON hip_hop_bookings(service);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_date ON hip_hop_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_hip_hop_bookings_created_at ON hip_hop_bookings(created_at);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_hip_hop_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hip_hop_bookings_updated_at
  BEFORE UPDATE ON hip_hop_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_hip_hop_bookings_updated_at();

-- Add comments to document the table structure
COMMENT ON TABLE hip_hop_bookings IS 'Stores booking requests from Hip Hop nominees for wellness services';
COMMENT ON COLUMN hip_hop_bookings.id IS 'Unique identifier for each booking';
COMMENT ON COLUMN hip_hop_bookings.first_name IS 'First name of the Hip Hop nominee';
COMMENT ON COLUMN hip_hop_bookings.last_name IS 'Last name of the Hip Hop nominee';
COMMENT ON COLUMN hip_hop_bookings.email IS 'Email address for booking confirmation';
COMMENT ON COLUMN hip_hop_bookings.phone IS 'Phone number for contact';
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, or nutrition';
COMMENT ON COLUMN hip_hop_bookings.preferred_date IS 'Preferred date for the appointment';
COMMENT ON COLUMN hip_hop_bookings.preferred_time IS 'Preferred time slot for the appointment';
COMMENT ON COLUMN hip_hop_bookings.notes IS 'Additional notes or special requests';
COMMENT ON COLUMN hip_hop_bookings.created_at IS 'Timestamp when the booking was created';
COMMENT ON COLUMN hip_hop_bookings.updated_at IS 'Timestamp when the booking was last updated';

-- Insert sample data for testing (optional - remove in production)
-- INSERT INTO hip_hop_bookings (
--   first_name, 
--   last_name, 
--   email, 
--   phone, 
--   service, 
--   preferred_date, 
--   preferred_time, 
--   notes
-- ) VALUES (
--   'Test',
--   'Nominee',
--   'test@example.com',
--   '555-0123',
--   'hbot',
--   CURRENT_DATE + INTERVAL '7 days',
--   '10:00 AM',
--   'Sample booking for testing'
-- );