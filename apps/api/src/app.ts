import express, { Express } from 'express';
import cors from 'cors';
import {
  errorMiddleware,
  notFoundMiddleware,
  rateLimitMiddleware,
  sanitizeInputMiddleware,
  parameterPollutionMiddleware,
  securityHeadersMiddleware,
  securityLoggerMiddleware,
  requestTimeoutMiddleware,
  userAgentValidationMiddleware,
  hostHeaderValidationMiddleware,
} from './middleware';
import { authRoutes, assetRoutes, collectionRoutes } from './routes';
import { corsOptions, helmetConfig, bodyParserConfig } from './config/security.config';
import 'reflect-metadata';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy if behind reverse proxy (nginx, load balancer)
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Security middleware - order matters!
  app.use(helmetConfig);
  app.use(cors(corsOptions));

  // Security headers
  app.use(securityHeadersMiddleware);

  // Request timeout
  app.use(requestTimeoutMiddleware(parseInt(process.env.REQUEST_TIMEOUT || '30000')));

  // User agent validation
  app.use(userAgentValidationMiddleware);

  // Host header validation
  if (process.env.ALLOWED_HOSTS) {
    app.use(hostHeaderValidationMiddleware);
  }

  // Body parsing with size limits
  app.use(express.json(bodyParserConfig.json));
  app.use(express.urlencoded(bodyParserConfig.urlencoded));

  // Input sanitization
  app.use(sanitizeInputMiddleware);

  // Parameter pollution prevention
  app.use(parameterPollutionMiddleware);

  // Security and request logging
  app.use(securityLoggerMiddleware);

  // Global rate limiting
  app.use(rateLimitMiddleware);

  // Health check endpoint (no rate limiting)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Readiness check endpoint
  app.get('/ready', (req, res) => {
    // Add checks for database, redis, etc.
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/collections', collectionRoutes);

  // 404 handler - must be after all routes
  app.use(notFoundMiddleware);

  // Global error handler - must be last
  app.use(errorMiddleware);

  return app;
};
