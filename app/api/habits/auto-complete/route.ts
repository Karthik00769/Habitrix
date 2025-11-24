import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all active habits for user
    const habits = await db.collection('habits').find({ 
      userId, 
      isActive: true 
    }).toArray();

    let completedCount = 0;

    for (const habit of habits) {
      // Check if already completed today
      const existingLog = await db.collection('habit_logs').findOne({
        habitId: habit._id,
        userId,
        completedAt: { $gte: today },
      });

      if (!existingLog) {
        // Auto-complete the habit
        const previousStreak = habit.streak || 0;
        let newStreak = 1;

        if (habit.lastCompletedAt) {
          const lastCompleted = new Date(habit.lastCompletedAt);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastCompleted >= yesterday && lastCompleted < today) {
            newStreak = previousStreak + 1;
          }
        }

        // Log completion
        await db.collection('habit_logs').insertOne({
          userId,
          habitId: habit._id,
          habitName: habit.name,
          habitCategory: habit.color,
          completedAt: now,
          streakAtCompletion: newStreak,
          autoCompleted: true,
        });

        // Update habit
        await db.collection('habits').updateOne(
          { _id: habit._id },
          {
            $set: {
              streak: newStreak,
              lastCompletedAt: now,
              updatedAt: now,
            },
            $inc: { totalCompletions: 1 },
          }
        );

        completedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      completedCount,
      message: `Auto-completed ${completedCount} habits` 
    });
  } catch (error) {
    console.error('Error auto-completing habits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
