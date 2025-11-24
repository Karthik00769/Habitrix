/**
 * MongoDB Connection Setup for Vercel Serverless
 * 
 * This file provides a reusable MongoDB connection that works with serverless functions.
 * It uses connection pooling to reuse connections across function invocations.
 * 
 * Collections:
 * - users: { _id, clerkId, email, createdAt }
 * - habits: { _id, userId, name, color, streak, lastCompletedAt, createdAt }
 * - habit_logs: { _id, userId, habitId, completedAt }
 * - achievements: { _id, userId, name, unlockedAt }
 * - tokens: { _id, userId, balance, updatedAt }
 */

import { MongoClient, Db, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;

// MongoDB connection options with Stable API
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each serverless function
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('habitrix');
}

export default clientPromise;
