# ATMOS Assessment System Setup Guide

## Overview
This guide will help you set up the ATMOS self-assessment system that allows users to complete wellness assessments after booking sessions. The system includes:

1. **Assessment Form**: A user-friendly form with sliders for pain, stress, focus, and happiness levels
2. **Database Storage**: Secure storage of assessment data with user associations
3. **Admin Dashboard**: Comprehensive view of all assessments with analytics and export capabilities
4. **API Endpoints**: RESTful API for assessment submission and retrieval

## Database Setup

### 1. Run the SQL Script
Execute the following SQL script in your Supabase database to create the necessary tables and views:

```sql
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

-- Admins can view all assessments (you'll need to create an admin role)
CREATE POLICY "Admins can view all assessments" ON assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can insert assessments for any user
CREATE POLICY "Admins can insert assessments" ON assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update any assessment
CREATE POLICY "Admins can update assessments" ON assessments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can delete any assessment
CREATE POLICY "Admins can delete assessments" ON assessments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

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
```

### 2. Optional: Create Admin Role Table
If you want to use the admin role system, create this additional table:

```sql
-- Create user_roles table for admin permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON user_roles TO authenticated;
```

## Features

### 1. Assessment Form
- **Location**: `/booking` page (appears after booking completion)
- **Fields**:
  - Date and time picker
  - First and last name
  - Pain level (0-10 slider)
  - Stress level (0-10 slider)
  - Focus level (0-10 slider)
  - Happiness level (0-10 slider)
- **Validation**: All fields are required and validated
- **Storage**: Data is saved to the `assessments` table

### 2. Admin Dashboard
- **Location**: `/admin` page → "Assessments" tab
- **Features**:
  - View all assessment submissions
  - Average scores for each metric
  - Detailed view of individual assessments
  - Export to CSV functionality
  - Real-time data refresh
  - Search and filter capabilities

### 3. API Endpoints
- **POST** `/api/assessments` - Submit new assessment
- **GET** `/api/assessments` - Retrieve assessments (with optional filters)

## Usage

### For Users
1. Complete a booking on the `/booking` page
2. After booking confirmation, the assessment form will appear
3. Fill out the assessment with current wellness levels
4. Submit the form to save your assessment

### For Admins
1. Navigate to `/admin` and log in
2. Click on the "Assessments" tab
3. View all assessment submissions
4. Use the export feature to download data for analysis
5. Click "View Details" to see individual assessment information

## Security Features

1. **Row Level Security (RLS)**: Users can only see their own assessments
2. **Admin Permissions**: Admins can view all assessments
3. **Input Validation**: All form inputs are validated on both client and server
4. **Data Integrity**: Database constraints ensure data quality

## Customization

### Styling
The assessment form uses Tailwind CSS classes and can be customized by modifying:
- `src/components/AssessmentForm.tsx`
- `src/components/AdminAssessmentDashboard.tsx`

### Questions
To modify the assessment questions, edit the form fields in:
- `src/components/AssessmentForm.tsx`

### Database Schema
To add new fields to the assessment, modify:
- The SQL schema in `database_setup.sql`
- The form component
- The API endpoint
- The admin dashboard

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase credentials in environment variables
   - Check if the database tables exist

2. **Permission Denied**
   - Ensure RLS policies are correctly set up
   - Verify user authentication status

3. **Form Not Appearing**
   - Check that the booking completion flow is working
   - Verify the assessment form component is imported

4. **Admin Dashboard Not Loading**
   - Ensure admin authentication is working
   - Check if the assessment_summary view exists

### Environment Variables
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

## Support
For technical support or questions about the assessment system, please refer to the project documentation or contact the development team.
