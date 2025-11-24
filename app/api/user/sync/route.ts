import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const db = await getDatabase();
    const now = new Date();

    // Upsert user data from Clerk
    await db.collection('users').updateOne(
      { clerkId: userId },
      {
        $set: {
          clerkId: userId,
          email: user?.emailAddresses[0]?.emailAddress || null,
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          username: user?.username || null,
          imageUrl: user?.imageUrl || null,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
