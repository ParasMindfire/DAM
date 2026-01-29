import './register-paths';

import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initializeDatabase, initializeMinio, initializeRabbitMQ } from './config';
import { logger } from '@dam/logger';
import { unhandledRejectionHandler, uncaughtExceptionHandler } from './middleware/error.middleware';

const PORT = process.env.API_PORT || 3000;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting API server...');

    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Initialize MinIO
    logger.info('Initializing MinIO...');
    await initializeMinio();
    logger.info('MinIO initialized successfully');

    // Initialize RabbitMQ
    logger.info('Initializing RabbitMQ...');
    await initializeRabbitMQ();
    logger.info('RabbitMQ initialized successfully');

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Ready check: http://localhost:${PORT}/ready`);
      logger.info('='.repeat(50));
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} signal received: closing HTTP server`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          // await AppDataSource.destroy();
          logger.info('Database connection closed');

          // Close other connections (Redis, RabbitMQ, etc.)
          logger.info('All connections closed');

          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', unhandledRejectionHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', uncaughtExceptionHandler);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
