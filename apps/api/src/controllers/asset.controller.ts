import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@dam/logger';
import {
  AssetStatus,
  FileUtils,
  STORAGE_CONSTANTS,
  QUEUE_CONSTANTS,
  MESSAGES_CONSTANTS,
} from '@dam/shared';
import { AppDataSource } from '../config';
import { Asset } from '../models';
import { storageService, queueService } from '../services';
import { ResponseUtil } from '../utils';

export class AssetController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        ResponseUtil.error(res, 'No file provided');
        return;
      }

      const { tags, description } = req.body;
      const file = req.file;

      if (!FileUtils.isValidFileSize(file.size)) {
        ResponseUtil.error(res, MESSAGES_CONSTANTS.VALIDATION.FILE_TOO_LARGE);
        return;
      }

      if (!FileUtils.isValidMimeType(file.mimetype)) {
        ResponseUtil.error(res, MESSAGES_CONSTANTS.VALIDATION.FILE_TYPE_INVALID);
        return;
      }

      const fileId = uuidv4();
      const extension = FileUtils.getFileExtension(file.originalname);
      const fileName = `${fileId}.${extension}`;

      await storageService.uploadFile(
        STORAGE_CONSTANTS.BUCKETS.ASSETS,
        fileName,
        file.buffer,
        file.mimetype
      );

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = assetRepository.create({
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        type: FileUtils.getAssetType(file.mimetype),
        status: AssetStatus.PROCESSING,
        metadata: {
          size: file.size,
          mimeType: file.mimetype,
        },
        downloadUrl: '',
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
        description,
        uploadedBy: req.user!.userId,
      });

      await assetRepository.save(asset);

      await queueService.publishMessage(
        QUEUE_CONSTANTS.EXCHANGES.ASSET,
        QUEUE_CONSTANTS.ROUTING_KEYS.ASSET_UPLOADED,
        {
          assetId: asset.id,
          fileName,
          mimeType: file.mimetype,
        }
      );

      logger.info(`Asset uploaded: ${asset.id}`);

      ResponseUtil.created(res, asset, MESSAGES_CONSTANTS.ASSET.UPLOAD_SUCCESS);
    } catch (error) {
      logger.error('Upload error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ASSET.UPLOAD_FAILED);
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, query, type, tags, status } = req.query;

      const assetRepository = AppDataSource.getRepository(Asset);
      const queryBuilder = assetRepository.createQueryBuilder('asset');

      if (query) {
        queryBuilder.andWhere('asset.originalName ILIKE :query OR asset.description ILIKE :query', {
          query: `%${query}%`,
        });
      }

      if (type) {
        queryBuilder.andWhere('asset.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('asset.status = :status', { status });
      }

      if (tags) {
        const tagArray = (tags as string).split(',');
        queryBuilder.andWhere('asset.tags && :tags', { tags: tagArray });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [assets, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('asset.createdAt', 'DESC')
        .getManyAndCount();

      ResponseUtil.success(res, {
        data: assets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Search error:', error);
      ResponseUtil.serverError(res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOne({ where: { id } });

      if (!asset) {
        ResponseUtil.notFound(res, MESSAGES_CONSTANTS.ASSET.NOT_FOUND);
        return;
      }

      ResponseUtil.success(res, asset);
    } catch (error) {
      logger.error('Get asset error:', error);
      ResponseUtil.serverError(res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOne({ where: { id } });

      if (!asset) {
        ResponseUtil.notFound(res, MESSAGES_CONSTANTS.ASSET.NOT_FOUND);
        return;
      }

      await storageService.deleteFile(STORAGE_CONSTANTS.BUCKETS.ASSETS, asset.fileName);

      if (asset.thumbnailUrl) {
        await storageService.deleteFile(
          STORAGE_CONSTANTS.BUCKETS.THUMBNAILS,
          `thumb_${asset.fileName}`
        );
      }

      await assetRepository.remove(asset);

      logger.info(`Asset deleted: ${id}`);

      ResponseUtil.success(res, null, MESSAGES_CONSTANTS.ASSET.DELETE_SUCCESS);
    } catch (error) {
      logger.error('Delete asset error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ASSET.DELETE_FAILED);
    }
  }

  async download(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOne({ where: { id } });

      if (!asset) {
        ResponseUtil.notFound(res, MESSAGES_CONSTANTS.ASSET.NOT_FOUND);
        return;
      }

      const url = await storageService.getPresignedUrl(
        STORAGE_CONSTANTS.BUCKETS.ASSETS,
        asset.fileName
      );

      ResponseUtil.success(res, { url });
    } catch (error) {
      logger.error('Download error:', error);
      ResponseUtil.serverError(res);
    }
  }
}

export const assetController = new AssetController();
