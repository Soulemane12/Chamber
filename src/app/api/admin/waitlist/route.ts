import { NextRequest, NextResponse } from 'next/server';

// TODO: Connect to your DB/model

export async function GET(req: NextRequest) {
  // Return all waitlist entries (stub)
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  // Add to waitlist (stub)
  return NextResponse.json({ success: true });
}
