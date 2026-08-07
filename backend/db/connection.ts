import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mutagent';

export async function connectDB() {
  try {
    let uri = MONGODB_URI;
    
    // If we're using the dummy password or localhost without mongo installed, use in-memory DB
    if (uri.includes(':dummy@') || uri.includes('<db_password>') || uri.includes('localhost')) {
      console.log(`[MongoDB] Initializing In-Memory Database for Hackathon Demo...`);
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error);
    process.exit(1);
  }
}
