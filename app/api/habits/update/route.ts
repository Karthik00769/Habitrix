import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { habitId, name } = body;

    if (!habitId || !name) {
      return NextResponse.json({ error: 'habitId and name are required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    const result = await db.collection('habits').updateOne(
      { _id: new ObjectId(habitId), userId },
      { 
        $set: { 
          name, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
