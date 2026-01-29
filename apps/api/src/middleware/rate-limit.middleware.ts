import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { logger } from '@dam/logger';
import { RateLimitError } from '../errors';

/**
 * Rate Limiter using Redis
 */
export class RateLimiter {
  private redis: Redis;
  private prefix: string;

  constructor(redisClient?: Redis, prefix: string = 'ratelimit') {
    this.redis =
      redisClient ||
      new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    this.prefix = prefix;

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });
  }

  /**
   * Create rate limit middleware
   */
  createMiddleware(options: {
    windowMs: number;
    max: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Generate key for this request
        const key = options.keyGenerator ? options.keyGenerator(req) : this.getDefaultKey(req);

        const redisKey = `${this.prefix}:${key}`;

        // Get current count
        const current = await this.redis.get(redisKey);
        const count = current ? parseInt(current, 10) : 0;

        // Check if limit exceeded
        if (count >= options.max) {
          const ttl = await this.redis.ttl(redisKey);

          res.setHeader('X-RateLimit-Limit', options.max.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());
          res.setHeader('Retry-After', ttl.toString());

          throw new RateLimitError(
            options.message || 'Too many requests, please try again later.',
            ttl
          );
        }

        // Increment counter
        const newCount = await this.redis.incr(redisKey);

        // Set expiry on first request
        if (newCount === 1) {
          await this.redis.pexpire(redisKey, options.windowMs);
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.max.toString());
        res.setHeader('X-RateLimit-Remaining', (options.max - newCount).toString());

        const ttl = await this.redis.pttl(redisKey);
        res.setHeader('X-RateLimit-Reset', (Date.now() + ttl).toString());

        // Store original end function
        const originalEnd = res.end;

        // Override end to handle skip options
        res.end = function (...args: unknown[]) {
          const statusCode = res.statusCode;

          // Decrement if we should skip this request
          if (
            (options.skipSuccessfulRequests && statusCode < 400) ||
            (options.skipFailedRequests && statusCode >= 400)
          ) {
            void rateLimiter.redis.decr(redisKey);
          }

          return originalEnd.apply(res, args as Parameters<typeof originalEnd>);
        };

        next();
      } catch (error) {
        if (error instanceof RateLimitError) {
          next(error);
        } else {
          logger.error('Rate limiter error:', error);
          // Continue without rate limiting on error
          next();
        }
      }
    };
  }

  /**
   * Default key generator (IP-based)
   */
  private getDefaultKey(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
      : req.socket.remoteAddress || 'unknown';

    return `${ip}:${req.path}`;
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    const redisKey = `${this.prefix}:${key}`;
    await this.redis.del(redisKey);
  }

  /**
   * Get remaining requests for a key
   */
  async getRemaining(key: string, max: number): Promise<number> {
    const redisKey = `${this.prefix}:${key}`;
    const current = await this.redis.get(redisKey);
    const count = current ? parseInt(current, 10) : 0;
    return Math.max(0, max - count);
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * General rate limiting middleware
 */
export const rateLimitMiddleware = rateLimiter.createMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Strict rate limiting for authentication routes
 */
export const authRateLimitMiddleware = rateLimiter.createMiddleware({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req: Request) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
      : req.socket.remoteAddress || 'unknown';

    return `auth:${ip}:${req.body?.email || 'unknown'}`;
  },
  skipSuccessfulRequests: false,
});

/**
 * Upload rate limiting middleware
 */
export const uploadRateLimitMiddleware = rateLimiter.createMiddleware({
  windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS || '50'),
  message: 'Too many upload requests, please try again later.',
  skipFailedRequests: true,
});
