import mongoose from 'mongoose';
import { envs } from './envs';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  try {
    // Attempt standard connection
    console.log(`Connecting to database: ${envs.DATABASE_URL}...`);
    
    // Set a short connection timeout so we don't hang for 30s in dev
    const options = {
      serverSelectionTimeoutMS: 3000,
    };
    
    const conn = await mongoose.connect(envs.DATABASE_URL, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error instanceof Error ? error.message : error}`);
    console.log('Spawning MongoMemoryServer fallback...');
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host} (${mongoUri})`);
    } catch (memError) {
      console.error(`Error connecting to In-Memory MongoDB: ${memError instanceof Error ? memError.message : memError}`);
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
