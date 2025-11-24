/**
 * GET /api/habits/list
 * 
 * List all habits for the authenticated user.
 * 
 * Response:
 * {
 *   "habits": [
 *     {
 *       "_id": "...",
 *       "name": "Exercise",
 *       "color": "#3b82f6",
 *       "streak": 5,
 *       "lastCompletedAt": "2024-01-15T10:30:00Z",
 *       "completedToday": true
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
    
    // Get all active habits for user
    const habits = await db
      .collection('habits')
      .find({ userId, isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();

    // Check which habits were completed today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const habitsWithStatus = await Promise.all(
      habits.map(async (habit) => {
        const completedToday = await db.collection('habit_logs').findOne({
          habitId: habit._id,
          userId,
          completedAt: { $gte: today },
        });

        return {
          _id: habit._id.toString(),
          name: habit.name,
          color: habit.color,
          streak: habit.streak || 0,
          lastCompletedAt: habit.lastCompletedAt,
          completedToday: !!completedToday,
        };
      })
    );

    return NextResponse.json({
      habits: habitsWithStatus,
    });
  } catch (error) {
    console.error('Error listing habits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
