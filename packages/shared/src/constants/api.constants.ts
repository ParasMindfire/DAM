export const API_CONSTANTS = {
  ROUTES: {
    AUTH: {
      BASE: '/auth',
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    ASSETS: {
      BASE: '/assets',
      UPLOAD: '/assets/upload',
      DOWNLOAD: '/assets/:id/download',
      DELETE: '/assets/:id',
      UPDATE: '/assets/:id',
      SEARCH: '/assets/search',
    },
    COLLECTIONS: {
      BASE: '/collections',
      CREATE: '/collections',
      GET: '/collections/:id',
      UPDATE: '/collections/:id',
      DELETE: '/collections/:id',
    },
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;
