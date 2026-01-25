import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initializeDatabase, initializeMinio, initializeRabbitMQ } from './config';
import { logger } from '@dam/logger';

const PORT = process.env.API_PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await initializeMinio();
    await initializeRabbitMQ();

    const app = createApp();

    app.listen(PORT, () => {
      logger.info(`API Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();
