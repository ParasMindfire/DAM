import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@dam/logger';
import { MESSAGES_CONSTANTS } from '@dam/shared';
import { ResponseUtil } from '../utils';
import { IJwtPayload } from '@dam/shared';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      ResponseUtil.unauthorized(res, MESSAGES_CONSTANTS.AUTH.TOKEN_MISSING);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      ResponseUtil.unauthorized(res, MESSAGES_CONSTANTS.AUTH.TOKEN_MISSING);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as IJwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    ResponseUtil.unauthorized(res, MESSAGES_CONSTANTS.AUTH.TOKEN_INVALID);
  }
};
