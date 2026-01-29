/**
 * Express Type Extensions
 * Extends Express Request type with optional session and user properties
 */

import { Session } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      /**
       * Session object (requires express-session middleware)
       * Install with: npm install express-session @types/express-session
       */
      session?: Session & {
        csrfToken?: string;
        [key: string]: unknown;
      };

      /**
       * Authenticated user object (set by auth middleware)
       */
      user?: {
        id: string;
        email: string;
        role?: string;
        [key: string]: unknown;
      };

      /**
       * Request ID for tracking (can be set by middleware)
       */
      requestId?: string;
    }
  }
}

export {};
