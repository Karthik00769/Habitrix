/**
 * GET /api/tokens
 * 
 * Get the token balance for the authenticated user.
 * 
 * Response:
 * {
 *   "balance": 42
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Get token balance
    const tokenDoc = await db.collection('tokens').findOne({ userId });

    return NextResponse.json({
      balance: tokenDoc?.balance || 0,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
