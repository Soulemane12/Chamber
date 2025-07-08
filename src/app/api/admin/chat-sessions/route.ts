import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// GET - Fetch all chat sessions
export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }

    return NextResponse.json(sessions || []);
  } catch (error) {
    console.error('Error in GET chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new chat session
export async function POST(request: Request) {
  try {
    const { title, messages } = await request.json();

    if (!title || !messages) {
      return NextResponse.json({ error: 'Title and messages are required' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        title,
        messages: JSON.stringify(messages),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in POST chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update an existing chat session
export async function PUT(request: Request) {
  try {
    const { id, title, messages } = await request.json();

    if (!id || !title || !messages) {
      return NextResponse.json({ error: 'ID, title, and messages are required' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .update({
        title,
        messages: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat session:', error);
      return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in PUT chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a chat session
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 