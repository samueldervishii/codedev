import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);

    server.close(() => {
      console.log('HTTP server closed');
    });

    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
