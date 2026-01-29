import { logger } from '@dam/logger';
import { AppError } from './custom-errors';

/**
 * Error Handler Utility
 * Centralizes error processing and logging
 */
export class ErrorHandler {
  /**
   * Check if error is operational (expected) or programming error
   */
  static isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: Error): void {
    if (error instanceof AppError) {
      if (error.isOperational) {
        logger.warn('Operational Error:', {
          name: error.name,
          message: error.message,
          statusCode: error.statusCode,
          code: error.code,
          details: error.details,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      } else {
        logger.error('Programming Error:', {
          name: error.name,
          message: error.message,
          statusCode: error.statusCode,
          stack: error.stack,
        });
      }
    } else {
      logger.error('Unexpected Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Handle critical errors that require process termination
   */
  static handleCriticalError(error: Error): void {
    this.logError(error);

    if (!this.isOperationalError(error)) {
      logger.error('Critical error detected. Shutting down gracefully...');

      // Give time for logging and cleanup
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }

  /**
   * Format error for API response
   */
  static formatError(error: Error): {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  } {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    return {
      message:
        process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      statusCode: 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  /**
   * Sanitize error message for production
   */
  static sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password[=:]\s*\S+/gi,
      /token[=:]\s*\S+/gi,
      /key[=:]\s*\S+/gi,
      /secret[=:]\s*\S+/gi,
      /authorization[=:]\s*\S+/gi,
    ];

    let sanitized = message;
    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }
}
