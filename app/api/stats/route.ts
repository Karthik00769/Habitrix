/**
 * GET /api/stats
 * 
 * Get comprehensive user statistics
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
    
    // Get user stats
    const stats = await db.collection('user_stats').findOne({ userId });
    
    // Get total habits
    const totalHabits = await db.collection('habits').countDocuments({ userId });
    
    // Get active habits
    const activeHabits = await db.collection('habits').countDocuments({ 
      userId, 
      isActive: true 
    });
    
    // Get total achievements
    const totalAchievements = await db.collection('achievements').countDocuments({ userId });
    
    // Get token balance
    const tokenDoc = await db.collection('tokens').findOne({ userId });
    
    // Get longest streak across all habits
    const habitsWithStreaks = await db.collection('habits')
      .find({ userId })
      .sort({ streak: -1 })
      .limit(1)
      .toArray();
    
    const longestStreak = habitsWithStreaks[0]?.streak || 0;

    return NextResponse.json({
      totalHabitsCreated: stats?.totalHabitsCreated || totalHabits,
      activeHabits,
      totalCompletions: stats?.totalCompletions || 0,
      totalTokensEarned: stats?.totalTokensEarned || 0,
      currentTokenBalance: tokenDoc?.balance || 0,
      longestStreak,
      totalAchievements,
      lastActivityAt: stats?.lastActivityAt || null,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
