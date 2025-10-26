-- Update hip_hop_bookings table constraint to include 'ifs' service
-- This fixes the constraint violation error when users select Internal Family Systems (IFS) service

-- First, drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint that includes 'ifs'
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check 
CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs';
