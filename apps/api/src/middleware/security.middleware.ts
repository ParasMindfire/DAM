import { Request, Response, NextFunction } from 'express';
import { logger } from '@dam/logger';
import { ForbiddenError, BadRequestError } from '../errors';
import { securityHeaders } from '../config/security.config';

/**
 * Security Middleware Collection
 */

/**
 * Add security headers to response
 */
export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  next();
};

/**
 * Prevent clickjacking attacks
 */
export const clickjackingProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
};

/**
 * MIME type sniffing protection
 */
export const mimeTypeProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

/**
 * Detect and block suspicious requests
 */
export const suspiciousRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const suspiciousPatterns = [
      // SQL Injection patterns
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      // Path traversal
      /\.\.[/\\]/g,
      // Command injection
      /[;&|`$()]/g,
    ];

    // Check URL, query params, and body
    const checkString = JSON.stringify({
      url: req.url,
      query: req.query,
      body: req.body,
    });

    const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(checkString));

    if (isSuspicious) {
      logger.warn('Suspicious request detected:', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      throw new ForbiddenError('Suspicious request detected');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = (maxSize: number = 10485760) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      throw new BadRequestError('Request entity too large', 'REQUEST_TOO_LARGE', {
        maxSize,
        actualSize: contentLength,
      });
    }

    next();
  };
};

/**
 * Slow request detection and timeout
 */
export const requestTimeoutMiddleware = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout:', {
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        res.status(408).json({
          success: false,
          error: 'Request timeout',
        });
      }
    }, timeout);

    // Clear timeout when response is sent
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

/**
 * Block requests from suspicious user agents
 */
export const userAgentValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userAgent = req.headers['user-agent'];

  // Block requests without user agent
  if (!userAgent) {
    logger.warn('Request without user agent:', {
      ip: req.ip,
      url: req.url,
    });
  }

  // Block known malicious user agents
  const blockedAgents = [/sqlmap/i, /nikto/i, /havij/i, /acunetix/i, /nessus/i, /masscan/i];

  if (userAgent && blockedAgents.some((pattern) => pattern.test(userAgent))) {
    logger.warn('Blocked malicious user agent:', {
      userAgent,
      ip: req.ip,
      url: req.url,
    });

    throw new ForbiddenError('Access denied');
  }

  next();
};

/**
 * IP whitelist/blacklist middleware
 */
export const ipFilterMiddleware = (options?: { whitelist?: string[]; blacklist?: string[] }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
      : req.socket.remoteAddress || 'unknown';

    // Check blacklist
    if (options?.blacklist && options.blacklist.includes(ip)) {
      logger.warn('Blocked blacklisted IP:', { ip, url: req.url });
      throw new ForbiddenError('Access denied');
    }

    // Check whitelist
    if (options?.whitelist && options.whitelist.length > 0) {
      if (!options.whitelist.includes(ip)) {
        logger.warn('Blocked non-whitelisted IP:', { ip, url: req.url });
        throw new ForbiddenError('Access denied');
      }
    }

    next();
  };
};

/**
 * Request logging middleware with security context
 */
export const securityLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
      : req.socket.remoteAddress;

    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.headers['user-agent'],
      contentLength: req.headers['content-length'],
    });
  });

  next();
};

/**
 * CSRF token validation middleware
 * Note: Requires express-session middleware to be installed and configured
 * Install with: npm install express-session @types/express-session
 */
export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    throw new ForbiddenError('Invalid CSRF token', 'CSRF_TOKEN_INVALID');
  }

  next();
};

/**
 * Prevent Host header injection
 */
export const hostHeaderValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const host = req.headers.host;
  const allowedHosts = process.env.ALLOWED_HOSTS?.split(',') || [];

  if (allowedHosts.length > 0 && host && !allowedHosts.includes(host)) {
    logger.warn('Invalid host header:', { host, ip: req.ip });
    throw new BadRequestError('Invalid host header');
  }

  next();
};
