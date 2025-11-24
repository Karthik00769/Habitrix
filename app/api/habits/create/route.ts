/**
 * POST /api/habits/create
 * 
 * Create a new habit for the authenticated user.
 * Stores all user input and metadata.
 * 
 * Request body:
 * {
 *   "name": "Exercise",
 *   "color": "#3b82f6"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "habitId": "..."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { checkHabitDiversityAchievements } from '@/lib/achievements';
import { broadcast } from '@/lib/sse';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();
    
    // Get user info from Clerk
    const user = await currentUser();
    
    // Get previous total habits count
    const previousTotalHabits = await db.collection('habits').countDocuments({ userId });
    const totalHabits = previousTotalHabits + 1;
    
    // Create the habit with full details
    const result = await db.collection('habits').insertOne({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || null,
      userName: user?.firstName || user?.username || null,
      name,
      color,
      streak: 0,
      totalCompletions: 0,
      lastCompletedAt: null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    // Check for diversity achievements
    const diversityAchievements = checkHabitDiversityAchievements(totalHabits, previousTotalHabits);
    let tokensAwarded = 0;

    for (const achievement of diversityAchievements) {
      // Check if already unlocked
      const existing = await db.collection('achievements').findOne({
        userId,
        name: achievement.name,
      });

      if (!existing) {
        // Save achievement
        await db.collection('achievements').insertOne({
          userId,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          tokenReward: achievement.tokenReward,
          unlockedAt: now,
          totalHabitsAtUnlock: totalHabits,
        });

        // Award tokens
        tokensAwarded += achievement.tokenReward;
      }
    }

    // Award tokens if any achievements unlocked
    if (tokensAwarded > 0) {
      const tokenDoc = await db.collection('tokens').findOneAndUpdate(
        { userId },
        {
          $inc: { balance: tokensAwarded },
          $set: { updatedAt: now },
          $setOnInsert: { userId, createdAt: now },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Broadcast token update via SSE
      broadcast(userId, {
        type: 'token_update',
        newBalance: tokenDoc?.balance || tokensAwarded,
      });
    }

    // Update user stats
    await db.collection('user_stats').updateOne(
      { userId },
      {
        $set: {
          userId,
          lastActivityAt: now,
          updatedAt: now,
        },
        $inc: {
          totalHabitsCreated: 1,
        },
        $setOnInsert: {
          createdAt: now,
          totalCompletions: 0,
          totalTokensEarned: 0,
          longestStreak: 0,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      habitId: result.insertedId.toString(),
      achievementsUnlocked: diversityAchievements.map(a => a.name),
      tokensAwarded,
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
