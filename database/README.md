# Database Setup

This directory contains SQL files for setting up database tables and schemas.

## Files

### `hip_hop_bookings.sql`
Creates the table for storing Hip Hop nominees wellness booking requests.

**Features:**
- Stores booking information for 5 wellness services
- Automatic timestamp management
- Performance indexes
- Data validation constraints
- Comprehensive documentation

**Services supported:**
- `hbot` - Hyperbaric Oxygen Therapy
- `electric-exercise` - EMS Electric Exercise
- `pemf` - PEMF Therapy
- `nmr` - Neuromuscular Reeducation
- `nutrition` - Personalized Nutrition & Metabolic Optimization

## Usage

### To run in Supabase Dashboard:
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `hip_hop_bookings.sql`
3. Execute the query

### To run via command line (if you have psql access):
```bash
psql "your_database_connection_string" -f database/hip_hop_bookings.sql
```

## Table Structure

```sql
hip_hop_bookings (
  id UUID PRIMARY KEY,
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
)
```

## Fallback Behavior

If the `hip_hop_bookings` table doesn't exist, the API will automatically fall back to storing Hip Hop bookings in the regular `bookings` table with special notation in the notes field.