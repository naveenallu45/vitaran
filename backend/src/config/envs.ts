import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const envs = {
  PORT: process.env.PORT || '5001',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/vitaran',
  JWT_SECRET: process.env.JWT_SECRET || 'vitaran_fallback_secret_key_123',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
