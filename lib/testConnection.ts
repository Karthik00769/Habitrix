/**
 * Test MongoDB Connection
 * 
 * Run this to verify your MongoDB connection works.
 * Usage: npm run test:db
 */

import { getDatabase } from './mongodb.js';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const db = await getDatabase();
    
    // Ping the database
    await db.command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nExisting collections:', collections.map(c => c.name));
    
    // Create indexes for better performance
    console.log('\nCreating indexes...');
    
    await db.collection('habits').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('habit_logs').createIndex({ userId: 1, habitId: 1, completedAt: -1 });
    await db.collection('achievements').createIndex({ userId: 1, unlockedAt: -1 });
    await db.collection('tokens').createIndex({ userId: 1 });
    
    console.log('✅ Indexes created successfully!');
    
    console.log('\n🎉 Database is ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
