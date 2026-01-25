import { Request, Response } from 'express';
import { logger } from '@dam/logger';
import { MESSAGES_CONSTANTS } from '@dam/shared';
import { ResponseUtil } from '../utils';

export const errorMiddleware = (err: Error, req: Request, res: Response): void => {
  logger.error('Error:', err);
  ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ERROR.GENERIC);
};
