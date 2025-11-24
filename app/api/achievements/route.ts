/**
 * GET /api/achievements
 * 
 * Fetch all achievements unlocked by the authenticated user.
 * 
 * Response:
 * {
 *   "achievements": [
 *     {
 *       "name": "Consistency Starter",
 *       "unlockedAt": "2024-01-15T10:30:00Z"
 *     }
 *   ]
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
    
    // Get all achievements for user
    const achievements = await db
      .collection('achievements')
      .find({ userId })
      .sort({ unlockedAt: -1 })
      .toArray();

    return NextResponse.json({
      achievements: achievements.map(a => ({
        name: a.name,
        unlockedAt: a.unlockedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
