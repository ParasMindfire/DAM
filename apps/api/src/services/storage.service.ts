import { Readable } from 'stream';
import { logger } from '@dam/logger';
import { minioClient } from '../config';

export class StorageService {
  async uploadFile(
    bucket: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const stream = Readable.from(fileBuffer);
      await minioClient.putObject(bucket, fileName, stream, fileBuffer.length, {
        'Content-Type': mimeType,
      });

      logger.info(`File uploaded successfully: ${fileName}`);
      return fileName;
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getFile(bucket: string, fileName: string): Promise<Buffer> {
    try {
      const stream = await minioClient.getObject(bucket, fileName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('Error getting file:', error);
      throw new Error('Failed to get file');
    }
  }

  async deleteFile(bucket: string, fileName: string): Promise<void> {
    try {
      await minioClient.removeObject(bucket, fileName);
      logger.info(`File deleted successfully: ${fileName}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getPresignedUrl(bucket: string, fileName: string, expiry = 3600): Promise<string> {
    try {
      const url = await minioClient.presignedGetObject(bucket, fileName, expiry);
      return url;
    } catch (error) {
      logger.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }
}

export const storageService = new StorageService();
