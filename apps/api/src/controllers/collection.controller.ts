import { Request, Response } from 'express';
import { logger } from '@dam/logger';
import { MESSAGES_CONSTANTS } from '@dam/shared';
import { AppDataSource } from '../config';
import { Collection } from '../models';
import { ResponseUtil } from '../utils';

export class CollectionController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, isPublic } = req.body;

      const collectionRepository = AppDataSource.getRepository(Collection);
      const collection = collectionRepository.create({
        name,
        description,
        isPublic: isPublic || false,
        createdBy: req.user!.userId,
        assetIds: [],
      });

      await collectionRepository.save(collection);

      logger.info(`Collection created: ${collection.id}`);

      ResponseUtil.created(res, collection, MESSAGES_CONSTANTS.COLLECTION.CREATE_SUCCESS);
    } catch (error) {
      logger.error('Create collection error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.COLLECTION.CREATE_FAILED);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const collectionRepository = AppDataSource.getRepository(Collection);
      const collections = await collectionRepository.find({
        where: [{ createdBy: req.user!.userId }, { isPublic: true }],
        order: { createdAt: 'DESC' },
      });

      ResponseUtil.success(res, collections);
    } catch (error) {
      logger.error('Get collections error:', error);
      ResponseUtil.serverError(res);
    }
  }

  async addAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { assetId } = req.body;

      const collectionRepository = AppDataSource.getRepository(Collection);
      const collection = await collectionRepository.findOne({ where: { id } });

      if (!collection) {
        ResponseUtil.notFound(res, MESSAGES_CONSTANTS.COLLECTION.NOT_FOUND);
        return;
      }

      if (!collection.assetIds.includes(assetId)) {
        collection.assetIds.push(assetId);
        await collectionRepository.save(collection);
      }

      ResponseUtil.success(res, collection);
    } catch (error) {
      logger.error('Add asset to collection error:', error);
      ResponseUtil.serverError(res);
    }
  }
}

export const collectionController = new CollectionController();
