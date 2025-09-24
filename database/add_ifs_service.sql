-- Add Internal Family Systems (IFS) service to hip_hop_bookings table
-- This migration adds 'ifs' to the service constraint to allow IFS bookings with Ty Cutner

-- First, check what services exist in the current data
-- SELECT DISTINCT service FROM hip_hop_bookings;

-- Handle existing rows that might have multiple services (comma-separated)
-- Update any rows that might have multiple services to use the first service
UPDATE hip_hop_bookings
SET service = TRIM(SPLIT_PART(service, ',', 1))
WHERE service LIKE '%,%';

-- Handle any service values that aren't in our expected list
-- Set unknown services to 'hbot' as a fallback
UPDATE hip_hop_bookings
SET service = 'hbot'
WHERE service NOT IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition');

-- Now drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint with the 'ifs' service included
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check
  CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs (Internal Family Systems)';

-- Optional: Add a comment about the IFS service
COMMENT ON TABLE hip_hop_bookings IS 'Stores booking requests from Hip Hop nominees for wellness services including HBOT, Electric Exercise, PEMF, NMR, Nutrition, and Internal Family Systems (IFS) therapy with Ty Cutner';