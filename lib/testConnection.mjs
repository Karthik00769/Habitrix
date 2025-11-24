/**
 * Test MongoDB Connection
 * 
 * Run this to verify your MongoDB connection works.
 * Usage: node lib/testConnection.mjs
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

async function testConnection() {
  let client;
  
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Database: habitrix');
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    const db = client.db('habitrix');
    
    // Ping the database
    await db.command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📦 Existing collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (will be created automatically)');
    
    // Create indexes for better performance
    console.log('\n🔧 Creating indexes...');
    
    await db.collection('habits').createIndex({ userId: 1, createdAt: -1 });
    console.log('  ✓ habits index created');
    
    await db.collection('habit_logs').createIndex({ userId: 1, habitId: 1, completedAt: -1 });
    console.log('  ✓ habit_logs index created');
    
    await db.collection('achievements').createIndex({ userId: 1, unlockedAt: -1 });
    console.log('  ✓ achievements index created');
    
    await db.collection('tokens').createIndex({ userId: 1 });
    console.log('  ✓ tokens index created');
    
    console.log('\n✅ Indexes created successfully!');
    
    // Test write operation
    console.log('\n🧪 Testing write operation...');
    const testResult = await db.collection('_test').insertOne({ test: true, timestamp: new Date() });
    console.log('  ✓ Write test successful');
    
    // Clean up test
    await db.collection('_test').deleteOne({ _id: testResult.insertedId });
    console.log('  ✓ Cleanup successful');
    
    console.log('\n🎉 Database is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Sign in to your app');
    console.log('  3. Create a habit');
    console.log('  4. Check MongoDB Atlas to see the data!');
    
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:');
    console.error(error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your MongoDB username and password in .env');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Tip: Check your internet connection and MongoDB Atlas IP whitelist');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection();
