import { Request, Response } from 'express';
import { HTTP_CONSTANTS } from '@dam/shared';
import { ErrorHandler } from '../errors/error-handler';

/**
 * Global Error Middleware
 * Catches all errors and formats them for API response
 */
export const errorMiddleware = (error: Error, req: Request, res: Response): void => {
  // Log the error
  ErrorHandler.logError(error);

  // Format error response
  const formattedError = ErrorHandler.formatError(error);

  // Sanitize message in production
  const message =
    process.env.NODE_ENV === 'production'
      ? ErrorHandler.sanitizeErrorMessage(formattedError.message)
      : formattedError.message;

  // Send error response
  res.status(formattedError.statusCode).json({
    success: false,
    error: message,
    code: formattedError.code,
    details: process.env.NODE_ENV === 'development' ? formattedError.details : undefined,
    stack: formattedError.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
};

/**
 * 404 Not Found Middleware
 * Handles routes that don't exist
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(HTTP_CONSTANTS.STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
};

/**
 * Unhandled Rejection Handler
 * Catches unhandled promise rejections
 */
export const unhandledRejectionHandler = (reason: Error): void => {
  ErrorHandler.logError(new Error(`Unhandled Rejection: ${reason.message}`));
  ErrorHandler.handleCriticalError(reason);
};

/**
 * Uncaught Exception Handler
 * Catches uncaught exceptions
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  ErrorHandler.logError(new Error(`Uncaught Exception: ${error.message}`));
  ErrorHandler.handleCriticalError(error);
};
