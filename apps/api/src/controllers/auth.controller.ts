import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@dam/logger';
import { MESSAGES_CONSTANTS, APP_CONSTANTS } from '@dam/shared';
import { AppDataSource } from '../config';
import { User } from '../models';
import { ResponseUtil, ValidationUtil } from '../utils';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      const validation = ValidationUtil.validateAll([
        () => ValidationUtil.validateEmail(email),
        () => ValidationUtil.validatePassword(password),
        () => ValidationUtil.validateName(firstName, 'firstName'),
        () => ValidationUtil.validateName(lastName, 'lastName'),
      ]);

      if (!validation.isValid) {
        ResponseUtil.error(res, validation.errors[0].message);
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        ResponseUtil.error(res, MESSAGES_CONSTANTS.AUTH.USER_EXISTS);
        return;
      }

      const user = userRepository.create({
        email,
        password,
        firstName,
        lastName,
      });

      await userRepository.save(user);

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: APP_CONSTANTS.JWT_EXPIRY }
      );

      logger.info(`User registered: ${email}`);

      ResponseUtil.created(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        MESSAGES_CONSTANTS.AUTH.REGISTER_SUCCESS
      );
    } catch (error) {
      logger.error('Register error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ERROR.SERVER);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const validation = ValidationUtil.validateAll([
        () => ValidationUtil.validateEmail(email),
        () => ValidationUtil.validatePassword(password),
      ]);

      if (!validation.isValid) {
        ResponseUtil.error(res, validation.errors[0].message);
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        ResponseUtil.unauthorized(res, MESSAGES_CONSTANTS.AUTH.INVALID_CREDENTIALS);
        return;
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        ResponseUtil.unauthorized(res, MESSAGES_CONSTANTS.AUTH.INVALID_CREDENTIALS);
        return;
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: APP_CONSTANTS.JWT_EXPIRY }
      );

      logger.info(`User logged in: ${email}`);

      ResponseUtil.success(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
        MESSAGES_CONSTANTS.AUTH.LOGIN_SUCCESS
      );
    } catch (error) {
      logger.error('Login error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ERROR.SERVER);
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req.user?.userId },
      });

      if (!user) {
        ResponseUtil.notFound(res, MESSAGES_CONSTANTS.AUTH.USER_NOT_FOUND);
        return;
      }

      ResponseUtil.success(res, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      logger.error('Get me error:', error);
      ResponseUtil.serverError(res, MESSAGES_CONSTANTS.ERROR.SERVER);
    }
  }
}

export const authController = new AuthController();
