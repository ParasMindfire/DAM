import { HTTP_CONSTANTS } from '@dam/shared';

/**
 * Base Application Error
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HTTP_CONSTANTS.STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    code?: string,
    details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * Bad Request Error (400)
 * Used for invalid input or malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code?: string, details?: unknown) {
    super(message, HTTP_CONSTANTS.STATUS.BAD_REQUEST, true, code, details);
    this.name = 'BadRequestError';
  }
}

/**
 * Validation Error (400)
 * Used for validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', details?: unknown) {
    super(message, HTTP_CONSTANTS.STATUS.BAD_REQUEST, true, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized Error (401)
 * Used for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, HTTP_CONSTANTS.STATUS.UNAUTHORIZED, true, code);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 * Used for authorization failures
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, HTTP_CONSTANTS.STATUS.FORBIDDEN, true, code);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 * Used when resources are not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource Not Found', code?: string) {
    super(message, HTTP_CONSTANTS.STATUS.NOT_FOUND, true, code);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 * Used for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource Conflict', code?: string, details?: unknown) {
    super(message, 409, true, code, details);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error (429)
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too Many Requests', retryAfter?: number) {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Internal Server Error (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code?: string) {
    super(message, HTTP_CONSTANTS.STATUS.INTERNAL_SERVER_ERROR, true, code);
    this.name = 'InternalServerError';
  }
}

/**
 * Database Error (500)
 * Used for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database Error', details?: unknown) {
    super(message, HTTP_CONSTANTS.STATUS.INTERNAL_SERVER_ERROR, true, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

/**
 * External Service Error (502)
 * Used when external services fail
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External Service Error', service?: string) {
    super(message, 502, true, 'EXTERNAL_SERVICE_ERROR', { service });
    this.name = 'ExternalServiceError';
  }
}

/**
 * File Upload Error (400)
 * Used for file upload failures
 */
export class FileUploadError extends AppError {
  constructor(message: string = 'File Upload Error', code?: string, details?: unknown) {
    super(message, HTTP_CONSTANTS.STATUS.BAD_REQUEST, true, code, details);
    this.name = 'FileUploadError';
  }
}
