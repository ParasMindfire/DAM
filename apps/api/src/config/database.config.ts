import { DataSource } from 'typeorm';
import { logger } from '@dam/logger';
import { User } from '../models';
import { Asset } from '../models';
import { Collection } from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Asset, Collection],
  migrations: ['src/migrations/**/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
};
