// This is the main entry point of the server application. Here, we import the Express app from app.ts
// and start the server on the specified port.

import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '@config/db';

import app from '@/app.ts';

import env from '@config/env';

import { logger } from '@config/logger';

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  // Start Express server
  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} on port ${env.PORT}`);
  });

  try {
  } catch (error) {
    logger.error('Failed to start server:' + error);
    process.exit(1);
  }
}

startServer();
