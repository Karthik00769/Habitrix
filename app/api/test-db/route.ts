/**
 * Test endpoint to verify database operations
 * GET /api/test-db
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('🔍 Test DB - User ID:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', userId: null },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    console.log('✅ Database connected');
    
    // Test write
    const testDoc = {
      userId,
      test: true,
      timestamp: new Date(),
    };
    
    const result = await db.collection('_test').insertOne(testDoc);
    console.log('✅ Test write successful:', result.insertedId);
    
    // Test read
    const doc = await db.collection('_test').findOne({ _id: result.insertedId });
    console.log('✅ Test read successful:', doc);
    
    // Clean up
    await db.collection('_test').deleteOne({ _id: result.insertedId });
    console.log('✅ Test cleanup successful');
    
    // Check existing data
    const habitsCount = await db.collection('habits').countDocuments({ userId });
    const tokensDoc = await db.collection('tokens').findOne({ userId });
    
    return NextResponse.json({
      success: true,
      userId,
      database: 'habitrix',
      habitsCount,
      tokenBalance: tokensDoc?.balance || 0,
      message: 'Database is working correctly!',
    });
  } catch (error: any) {
    console.error('❌ Test DB Error:', error);
    return NextResponse.json(
      { 
        error: 'Database error', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
