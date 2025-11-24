/**
 * POST /api/habits/complete
 * 
 * Mark a habit as complete for today.
 * - Logs the completion with full details
 * - Updates streak (increments if consecutive day, resets if gap)
 * - Awards 1 token
 * - Checks for all achievement types
 * - Awards bonus tokens for achievements
 * - Sends real-time SSE events
 * - Stores user stats
 * 
 * Request body:
 * {
 *   "habitId": "..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "newStreak": 5,
 *   "tokensAwarded": 1,
 *   "achievementsUnlocked": ["Consistency Starter"]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkAchievements, checkTotalCompletionAchievements, checkHabitDiversityAchievements } from '@/lib/achievements';
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
    const { habitId } = body;

    if (!habitId) {
      return NextResponse.json(
        { error: 'habitId is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get the habit
    const habit = await db.collection('habits').findOne({
      _id: new ObjectId(habitId),
      userId,
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already completed today
    const existingLog = await db.collection('habit_logs').findOne({
      habitId: new ObjectId(habitId),
      userId,
      completedAt: { $gte: today },
    });

    if (existingLog) {
      return NextResponse.json(
        { error: 'Habit already completed today' },
        { status: 400 }
      );
    }

    // Calculate new streak
    const previousStreak = habit.streak || 0;
    let newStreak = 1;

    if (habit.lastCompletedAt) {
      const lastCompleted = new Date(habit.lastCompletedAt);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // If completed yesterday, increment streak
      if (lastCompleted >= yesterday && lastCompleted < today) {
        newStreak = previousStreak + 1;
      }
    }

    // Get total completions before this one
    const previousTotalCompletions = await db.collection('habit_logs').countDocuments({ userId });
    const totalCompletions = previousTotalCompletions + 1;

    // Get total habits count
    const totalHabits = await db.collection('habits').countDocuments({ userId });

    // Log the completion with full details
    await db.collection('habit_logs').insertOne({
      userId,
      habitId: new ObjectId(habitId),
      habitName: habit.name,
      habitCategory: habit.color,
      completedAt: now,
      streakAtCompletion: newStreak,
      totalCompletionsAtTime: totalCompletions,
    });

    // Update habit streak and total completions
    await db.collection('habits').updateOne(
      { _id: new ObjectId(habitId) },
      {
        $set: {
          streak: newStreak,
          lastCompletedAt: now,
          updatedAt: now,
        },
        $inc: {
          totalCompletions: 1,
        },
      }
    );

    // Award base token (+1 for completion)
    let tokensAwarded = 1;

    // Check for all types of achievements
    const streakAchievements = checkAchievements(newStreak, previousStreak);
    const completionAchievements = checkTotalCompletionAchievements(totalCompletions, previousTotalCompletions);
    const diversityAchievements = checkHabitDiversityAchievements(totalHabits, totalHabits - 1);
    
    const allNewAchievements = [...streakAchievements, ...completionAchievements, ...diversityAchievements];
    const achievementNames: string[] = [];

    for (const achievement of allNewAchievements) {
      // Check if already unlocked
      const existing = await db.collection('achievements').findOne({
        userId,
        name: achievement.name,
      });

      if (!existing) {
        // Save achievement with full details
        await db.collection('achievements').insertOne({
          userId,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          tokenReward: achievement.tokenReward,
          unlockedAt: now,
          streakAtUnlock: newStreak,
          totalCompletionsAtUnlock: totalCompletions,
        });

        // Award bonus tokens
        tokensAwarded += achievement.tokenReward;
        achievementNames.push(achievement.name);
      }
    }

    // Update or create user stats
    await db.collection('user_stats').updateOne(
      { userId },
      {
        $set: {
          userId,
          lastActivityAt: now,
          updatedAt: now,
        },
        $inc: {
          totalCompletions: 1,
          totalTokensEarned: tokensAwarded,
        },
        $max: {
          longestStreak: newStreak,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Update token balance
    const tokenDoc = await db.collection('tokens').findOneAndUpdate(
      { userId },
      {
        $inc: { balance: tokensAwarded },
        $set: { updatedAt: now },
        $setOnInsert: { userId, createdAt: now },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const newBalance = tokenDoc?.balance || tokensAwarded;

    // Broadcast real-time update via SSE
    const { broadcast } = await import('@/lib/sse');
    broadcast(userId, {
      type: 'habit_completed',
      habitId: habitId,
      habitName: habit.name,
      newTokenBalance: newBalance,
      newStreak: newStreak,
      completedAt: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      newStreak,
      tokensAwarded,
      achievementsUnlocked: achievementNames,
      totalCompletions,
    });
  } catch (error) {
    console.error('Error completing habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
