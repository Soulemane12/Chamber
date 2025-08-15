-- Create assessments table for ATMOS self-assessment logs
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    assessment_date DATE NOT NULL,
    assessment_time VARCHAR(10) NOT NULL, -- Format: "HH:MM AM/PM"
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 0 AND stress_level <= 10),
    focus_level INTEGER NOT NULL CHECK (focus_level >= 0 AND focus_level <= 10),
    happiness_level INTEGER NOT NULL CHECK (happiness_level >= 0 AND happiness_level <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_booking_id ON assessments(booking_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own assessments
CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments" ON assessments
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow all authenticated users to view all assessments (for admin dashboard)
-- This works with your current localStorage-based admin system
CREATE POLICY "Allow all authenticated users to view assessments" ON assessments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to insert assessments
CREATE POLICY "Allow all authenticated users to insert assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow all authenticated users to update assessments
CREATE POLICY "Allow all authenticated users to update assessments" ON assessments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to delete assessments
CREATE POLICY "Allow all authenticated users to delete assessments" ON assessments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON assessments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a view for admin dashboard with user information
CREATE OR REPLACE VIEW assessment_summary AS
SELECT 
    a.id,
    a.assessment_date,
    a.assessment_time,
    a.first_name,
    a.last_name,
    a.pain_level,
    a.stress_level,
    a.focus_level,
    a.happiness_level,
    a.created_at,
    u.email as user_email,
    b.date as booking_date,
    b.time as booking_time,
    b.duration as booking_duration
FROM assessments a
LEFT JOIN auth.users u ON a.user_id = u.id
LEFT JOIN bookings b ON a.booking_id = b.id
ORDER BY a.created_at DESC;

-- Grant access to the view
GRANT SELECT ON assessment_summary TO authenticated;
