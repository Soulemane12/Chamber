import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function GET() {
  try {
    // Check if chat_sessions table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS chat_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            messages JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create index for faster queries
          CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
          
          -- Enable Row Level Security (RLS)
          ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
          
          -- Create policy to allow all operations for now (admin only access)
          CREATE POLICY "Allow all operations for chat_sessions" ON chat_sessions
            FOR ALL USING (true);
        `
      });

      if (createError) {
        console.error('Error creating chat_sessions table:', createError);
        return NextResponse.json({ 
          error: 'Failed to create chat_sessions table',
          details: createError.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'chat_sessions table created successfully' 
      });
    } else if (checkError) {
      console.error('Error checking chat_sessions table:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check chat_sessions table',
        details: checkError.message 
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'chat_sessions table already exists' 
      });
    }
  } catch (error) {
    console.error('Error in setup chat sessions:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 