import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mutagent';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[MongoDB] Connected to ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error);
    process.exit(1);
  }
}
