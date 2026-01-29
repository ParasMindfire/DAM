import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

/**
 * Sanitize and validate request input
 */
export class RequestValidator {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'string' ? this.sanitizeString(item) : item
          );
        } else if (value && typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate and sanitize request body
   */
  static validateBody(options?: {
    maxSize?: number;
    allowedFields?: string[];
    requiredFields?: string[];
  }) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Check if body exists
        if (!req.body || typeof req.body !== 'object') {
          throw new ValidationError('Invalid request body');
        }

        // Check body size
        const bodySize = JSON.stringify(req.body).length;
        const maxSize = options?.maxSize || 1048576; // 1MB default

        if (bodySize > maxSize) {
          throw new ValidationError('Request body too large', {
            maxSize,
            actualSize: bodySize,
          });
        }

        // Check required fields
        if (options?.requiredFields) {
          const missingFields = options.requiredFields.filter(
            (field) => !(field in req.body) || req.body[field] === undefined
          );

          if (missingFields.length > 0) {
            throw new ValidationError('Missing required fields', {
              missingFields,
            });
          }
        }

        // Filter allowed fields
        if (options?.allowedFields) {
          const filteredBody: Record<string, unknown> = {};

          for (const field of options.allowedFields) {
            if (field in req.body) {
              filteredBody[field] = req.body[field];
            }
          }

          req.body = filteredBody;
        }

        // Sanitize body
        req.body = this.sanitizeObject(req.body);

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate query parameters
   */
  static validateQuery(options?: { allowedParams?: string[]; sanitize?: boolean }) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Filter allowed parameters
        if (options?.allowedParams) {
          const filteredQuery: Record<string, unknown> = {};

          for (const param of options.allowedParams) {
            if (param in req.query) {
              filteredQuery[param] = req.query[param];
            }
          }

          req.query = filteredQuery as typeof req.query;
        }

        // Sanitize query parameters
        if (options?.sanitize !== false) {
          const sanitized = this.sanitizeObject(req.query as Record<string, unknown>);
          req.query = sanitized as typeof req.query;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate URL parameters
   */
  static validateParams(allowedParams: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const params = Object.keys(req.params);
        const invalidParams = params.filter((param) => !allowedParams.includes(param));

        if (invalidParams.length > 0) {
          throw new ValidationError('Invalid URL parameters', { invalidParams });
        }

        // Sanitize params
        req.params = this.sanitizeObject(req.params) as typeof req.params;

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Prevent parameter pollution
   */
  static preventParameterPollution(allowedDuplicates: string[] = []) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Check query parameters
        for (const key in req.query) {
          if (Array.isArray(req.query[key]) && !allowedDuplicates.includes(key)) {
            throw new ValidationError('Parameter pollution detected', {
              parameter: key,
            });
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate content type
   */
  static validateContentType(allowedTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const contentType = req.headers['content-type'];

        if (!contentType) {
          throw new ValidationError('Content-Type header is required');
        }

        const isAllowed = allowedTypes.some((type) =>
          contentType.toLowerCase().includes(type.toLowerCase())
        );

        if (!isAllowed) {
          throw new ValidationError('Invalid Content-Type', {
            received: contentType,
            allowed: allowedTypes,
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

/**
 * Middleware to sanitize all request inputs
 */
export const sanitizeInputMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = RequestValidator.sanitizeObject(req.body);
  }

  if (req.query) {
    const sanitized = RequestValidator.sanitizeObject(req.query as Record<string, unknown>);
    req.query = sanitized as typeof req.query;
  }

  if (req.params) {
    req.params = RequestValidator.sanitizeObject(req.params) as typeof req.params;
  }

  next();
};

/**
 * Middleware to prevent parameter pollution
 */
export const parameterPollutionMiddleware = RequestValidator.preventParameterPollution([
  'tags',
  'categories',
  'ids',
]);
