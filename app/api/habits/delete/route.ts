import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');

    if (!habitId) {
      return NextResponse.json({ error: 'habitId is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Soft delete - mark as inactive
    const result = await db.collection('habits').updateOne(
      { _id: new ObjectId(habitId), userId },
      { 
        $set: { 
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
