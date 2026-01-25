import * as Minio from 'minio';
import { logger } from '@dam/logger';
import { STORAGE_CONSTANTS } from '@dam/shared';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

export const initializeMinio = async (): Promise<void> => {
  try {
    const buckets = Object.values(STORAGE_CONSTANTS.BUCKETS);

    for (const bucket of buckets) {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        logger.info(`MinIO bucket created: ${bucket}`);
      }
    }

    logger.info('MinIO initialized successfully');
  } catch (error) {
    logger.error('Error initializing MinIO:', error);
    throw error;
  }
};
