import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@dam/logger';
import { errorMiddleware } from './middleware';
import { authRoutes, assetRoutes, collectionRoutes } from './routes';
import 'reflect-metadata';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/collections', collectionRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  app.use(errorMiddleware);

  return app;
};
