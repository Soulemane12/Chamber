import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl as string,
  serviceRoleKey as string,
);

interface CreditPackage {
  type: string;
  balance: number;
  expiresAt: string | null;
  packageName: string;
  purchasedAt: string;
  originalBalance: number;
  notes: string;
}

interface GrantCreditsRequest {
  userId: string;
  creditPackage: CreditPackage;
}

export async function POST(request: Request) {
  try {
    const body: GrantCreditsRequest = await request.json();

    if (!body.userId || !body.creditPackage) {
      return NextResponse.json(
        { error: 'Missing userId or creditPackage' },
        { status: 400 }
      );
    }

    // Get current user data
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(body.userId);

    if (getUserError || !userData.user) {
      console.error('Error getting user:', getUserError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get existing credits and add new one
    const existingCredits = (userData.user.user_metadata?.credits as any[]) || [];
    const updatedCredits = [...existingCredits, body.creditPackage];

    // Update user metadata with new credits
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(body.userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        credits: updatedCredits,
      }
    });

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        credits: updatedCredits
      }
    });
  } catch (error) {
    console.error('Unexpected error granting credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
