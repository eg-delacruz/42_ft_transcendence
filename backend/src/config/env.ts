import dotenv from 'dotenv';
dotenv.config();

interface Env {
  PORT: number;
  FRONT_PORT: number;
  MONGO_URI: string;
  SUPER_EMAIL: string;
  SUPER_PASS: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  VITE_CLIENT_HEADER_KEY: string;
  REDIS_URL: string; 
}

const env: Env = {
  PORT: Number(process.env.PORT) || 3000,
  FRONT_PORT: Number(process.env.FRONT_PORT) || 5173,
  MONGO_URI: process.env.MONGO_URI || '',
  SUPER_EMAIL: process.env.SUPER_EMAIL || '',
  SUPER_PASS: process.env.SUPER_PASS || '',
  JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  VITE_CLIENT_HEADER_KEY:
    process.env.VITE_CLIENT_HEADER_KEY || 'defaultclientkey',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379'
};

// Simple check to ensure required variables exist
if (!env.MONGO_URI || !env.SUPER_EMAIL || !env.SUPER_PASS) {
  throw new Error('Missing required environment variables in .env file');
}

export default env;
