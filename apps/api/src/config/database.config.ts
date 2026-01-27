import { DataSource } from 'typeorm';
import { logger } from '@dam/logger';
import { User } from '../models';
import { Asset } from '../models';
import { Collection } from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Pa1ra2@3',
  database: process.env.DB_NAME || 'DAM',
  synchronize: false, // Disable auto-sync
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Asset, Collection],
  migrations: ['src/migrations/**/*.ts'],
  migrationsRun: true, // Auto-run migrations on startup
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    logger.info('Database connection established successfully');
    logger.info('Migrations executed successfully');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
};
